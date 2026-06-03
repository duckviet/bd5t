package impl

import (
	"context"
	"encoding/json"
	"errors"
	"time"

	"github.com/duckviet/bd5t/backend/internal/domain"
	"github.com/duckviet/bd5t/backend/internal/logger"
	"github.com/duckviet/bd5t/backend/internal/repository/interfaces"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type NotificationRepository struct {
	pool *pgxpool.Pool
}

func NewNotificationRepository(pool *pgxpool.Pool) *NotificationRepository {
	return &NotificationRepository{pool: pool}
}

var _ interfaces.NotificationRepository = (*NotificationRepository)(nil)

func (r *NotificationRepository) ListByUser(ctx context.Context, userID string, page, pageSize int) ([]*domain.Notification, int, error) {
	offset := (page - 1) * pageSize

	var total int
	countQuery := `SELECT COUNT(*) FROM notifications WHERE user_id = $1`
	if err := r.pool.QueryRow(ctx, countQuery, userID).Scan(&total); err != nil {
		return nil, 0, err
	}

	query := `
		SELECT id, user_id, title, message, type, is_read, data, created_at
		FROM notifications
		WHERE user_id = $1
		ORDER BY created_at DESC
		LIMIT $2 OFFSET $3`

	rows, err := r.pool.Query(ctx, query, userID, pageSize, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	notifications := make([]*domain.Notification, 0)
	for rows.Next() {
		notification, err := scanNotification(rows)
		if err != nil {
			return nil, 0, err
		}
		notifications = append(notifications, notification)
	}
	if err := rows.Err(); err != nil {
		return nil, 0, err
	}

	return notifications, total, nil
}

func (r *NotificationRepository) Create(ctx context.Context, notification *domain.Notification) error {
	dataBytes, err := json.Marshal(notification.Data)
	if err != nil {
		return err
	}

	query := `
		INSERT INTO notifications (user_id, title, message, type, is_read, data)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, created_at`

	return r.pool.QueryRow(
		ctx,
		query,
		notification.UserID,
		notification.Title,
		notification.Message,
		notification.Type,
		notification.IsRead,
		dataBytes,
	).Scan(&notification.ID, &notification.CreatedAt)
}

func (r *NotificationRepository) CreateIdempotent(ctx context.Context, notification *domain.Notification) (bool, error) {
	dataBytes, err := json.Marshal(notification.Data)
	if err != nil {
		return false, err
	}

	query := `
		INSERT INTO notifications (user_id, title, message, type, is_read, data)
		VALUES ($1, $2, $3, $4, $5, $6)
		ON CONFLICT DO NOTHING
		RETURNING id, created_at`

	err = r.pool.QueryRow(
		ctx,
		query,
		notification.UserID,
		notification.Title,
		notification.Message,
		notification.Type,
		notification.IsRead,
		dataBytes,
	).Scan(&notification.ID, &notification.CreatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return false, nil
	}
	if err != nil {
		return false, err
	}

	return true, nil
}

type activityInfo struct {
	ID          string
	Title       string
	Slug        string
	UnitID      *string
	EndDate     *time.Time
	ReviewLevel string
}

func (r *NotificationRepository) ListActivityNotificationRecipients(
	ctx context.Context, activityID, notificationType string,
) ([]*interfaces.ActivityNotificationRecipient, error) {
	// Step 1: Lấy thông tin hoạt động và các mã tiêu chí đi kèm
	activity, criteriaCodes, err := r.getActivityWithCriteria(ctx, activityID)
	if err != nil {
		logger.Error().Err(err).Str("activity_id", activityID).Msg("ListActivityNotificationRecipients Step 1 Failed")
		return nil, err
	}
	if activity == nil {
		logger.Log().Str("activity_id", activityID).Msg("ListActivityNotificationRecipients: activity not found or inactive")
		return nil, nil
	}
	logger.Log().
		Str("activity_id", activityID).
		Int("criteria_count", len(criteriaCodes)).
		Msg("ListActivityNotificationRecipients Step 1 Success: fetched activity info and criteria codes")

	// Step 2: Lấy danh sách sinh viên hợp lệ theo khoa/đơn vị của hoạt động
	userIDs, err := r.getEligibleStudents(ctx, activity.UnitID)
	if err != nil {
		logger.Error().Err(err).Str("activity_id", activityID).Msg("ListActivityNotificationRecipients Step 2 Failed")
		return nil, err
	}
	logger.Log().
		Str("activity_id", activityID).
		Int("eligible_user_count", len(userIDs)).
		Msg("ListActivityNotificationRecipients Step 2 Success: fetched eligible students matching unit constraint")

	// Step 3: Loại bỏ các sinh viên đã có evidence được duyệt hoặc chờ duyệt cho chính hoạt động này
	userIDs, err = r.filterOutUsersWithEvidence(ctx, userIDs, activityID)
	if err != nil {
		logger.Error().Err(err).Str("activity_id", activityID).Msg("ListActivityNotificationRecipients Step 3 Failed")
		return nil, err
	}
	logger.Log().
		Str("activity_id", activityID).
		Int("remaining_user_count", len(userIDs)).
		Msg("ListActivityNotificationRecipients Step 3 Success: filtered out students with existing evidence")

	// Step 4: Xử lý theo loại thông báo
	var recipients []*interfaces.ActivityNotificationRecipient
	if notificationType == "SUGGESTION" {
		// Chỉ gửi SUGGESTION cho những sinh viên thực sự thiếu tiêu chí này
		recipients, err = r.computeMissingCriteriaPerUser(ctx, userIDs, activity, criteriaCodes)
		if err != nil {
			logger.Error().Err(err).Str("activity_id", activityID).Msg("ListActivityNotificationRecipients Step 4 (SUGGESTION) Failed")
			return nil, err
		}
	} else {
		// Các loại thông báo khác (NEW, DEADLINE_SOON): gửi cho toàn bộ sinh viên còn lại kèm full danh sách tiêu chí của hoạt động
		recipients = buildRecipientsAllCriteria(userIDs, activity, criteriaCodes)
	}

	logger.Log().
		Str("activity_id", activityID).
		Str("notification_type", notificationType).
		Int("recipient_count", len(recipients)).
		Msg("ListActivityNotificationRecipients Step 4 Success: completed computation")

	return recipients, nil
}

func (r *NotificationRepository) getActivityWithCriteria(ctx context.Context, activityID string) (*activityInfo, []string, error) {
	queryActivity := `
		SELECT id, title, COALESCE(slug, '') AS slug, unit_id, end_date, COALESCE(review_level, 'TRUONG') AS review_level
		FROM activities
		WHERE id = $1 AND is_active = TRUE`

	var act activityInfo
	var unitID *string
	err := r.pool.QueryRow(ctx, queryActivity, activityID).Scan(
		&act.ID,
		&act.Title,
		&act.Slug,
		&unitID,
		&act.EndDate,
		&act.ReviewLevel,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil, nil
	}
	if err != nil {
		return nil, nil, err
	}
	act.UnitID = unitID

	queryCriteria := `
		SELECT c.code
		FROM activity_criteria ac
		JOIN criteria c ON c.id = ac.criteria_id
		WHERE ac.activity_id = $1`

	rows, err := r.pool.Query(ctx, queryCriteria, activityID)
	if err != nil {
		return nil, nil, err
	}
	defer rows.Close()

	var criteriaCodes []string
	for rows.Next() {
		var code string
		if err := rows.Scan(&code); err != nil {
			return nil, nil, err
		}
		criteriaCodes = append(criteriaCodes, code)
	}
	if err := rows.Err(); err != nil {
		return nil, nil, err
	}

	return &act, criteriaCodes, nil
}

func (r *NotificationRepository) getEligibleStudents(ctx context.Context, unitID *string) ([]string, error) {
	query := `
		SELECT id::text
		FROM users
		WHERE role = 'student'`

	rows, err := r.pool.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var userIDs []string
	for rows.Next() {
		var id string
		if err := rows.Scan(&id); err != nil {
			return nil, err
		}
		userIDs = append(userIDs, id)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	return userIDs, nil
}

func (r *NotificationRepository) filterOutUsersWithEvidence(ctx context.Context, userIDs []string, activityID string) ([]string, error) {
	if len(userIDs) == 0 {
		return userIDs, nil
	}

	query := `
		SELECT DISTINCT user_id::text
		FROM evidences
		WHERE activity_id = $1::uuid AND status IN ('approved', 'pending')`

	rows, err := r.pool.Query(ctx, query, activityID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	excludeUsers := make(map[string]bool)
	for rows.Next() {
		var userID string
		if err := rows.Scan(&userID); err != nil {
			return nil, err
		}
		excludeUsers[userID] = true
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	var filtered []string
	for _, id := range userIDs {
		if !excludeUsers[id] {
			filtered = append(filtered, id)
		}
	}

	return filtered, nil
}

func (r *NotificationRepository) computeMissingCriteriaPerUser(
	ctx context.Context,
	userIDs []string,
	activity *activityInfo,
	criteriaCodes []string,
) ([]*interfaces.ActivityNotificationRecipient, error) {
	if len(userIDs) == 0 {
		return nil, nil
	}

	query := `
		WITH target_activity AS (
			SELECT 
				$1::uuid AS id, 
				$2::text AS title, 
				$3::text AS slug, 
				$4::text AS review_level, 
				$5::timestamp with time zone AS end_date
		),
		provided_criteria AS (
			SELECT
				ta.id AS activity_id,
				ta.title AS activity_title,
				ta.slug AS activity_slug,
				ta.review_level,
				ta.end_date,
				c.code AS criteria_code
			FROM target_activity ta
			JOIN criteria c ON c.code = ANY($6::text[])
		),
		eligible_users AS (
			SELECT unnest($7::text[])::uuid AS user_id
		),
		missing_criteria AS (
			SELECT eu.user_id, pc.*
			FROM eligible_users eu
			JOIN provided_criteria pc ON TRUE
			WHERE NOT EXISTS (
				SELECT 1
				FROM evidences e
				JOIN activities evidence_activity ON evidence_activity.id = e.activity_id
				LEFT JOIN activity_criteria selected_ac ON selected_ac.id = e.activity_criteria_id
				LEFT JOIN criteria selected_c ON selected_c.id = selected_ac.criteria_id
				WHERE e.user_id = eu.user_id
				  AND e.status IN ('approved', 'pending')
				  AND COALESCE(evidence_activity.review_level, 'TRUONG') = pc.review_level
				  AND (
					(e.activity_criteria_id IS NOT NULL AND selected_c.code = pc.criteria_code)
					OR (e.activity_criteria_id IS NULL AND e.criterion_type IS NOT NULL AND e.criterion_type = pc.criteria_code)
					OR (
						e.activity_criteria_id IS NULL
						AND e.criterion_type IS NULL
						AND EXISTS (
							SELECT 1
							FROM activity_criteria whole_ac
							JOIN criteria whole_c ON whole_c.id = whole_ac.criteria_id
							WHERE whole_ac.activity_id = e.activity_id
							  AND whole_c.code = pc.criteria_code
						)
					)
				  )
			)
		)
		SELECT
			user_id::text,
			activity_id::text,
			COALESCE(activity_slug, '') AS activity_slug,
			activity_title,
			review_level,
			COALESCE(array_agg(DISTINCT criteria_code ORDER BY criteria_code) FILTER (WHERE criteria_code IS NOT NULL), '{}') AS missing_criteria,
			end_date
		FROM missing_criteria
		GROUP BY user_id, activity_id, activity_slug, activity_title, review_level, end_date
		ORDER BY user_id`

	rows, err := r.pool.Query(ctx, query,
		activity.ID,
		activity.Title,
		activity.Slug,
		activity.ReviewLevel,
		activity.EndDate,
		criteriaCodes,
		userIDs,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	recipients := make([]*interfaces.ActivityNotificationRecipient, 0)
	for rows.Next() {
		recipient := &interfaces.ActivityNotificationRecipient{}
		if err := rows.Scan(
			&recipient.UserID,
			&recipient.ActivityID,
			&recipient.ActivitySlug,
			&recipient.ActivityTitle,
			&recipient.ReviewLevel,
			&recipient.Criteria,
			&recipient.EndDate,
		); err != nil {
			return nil, err
		}
		recipients = append(recipients, recipient)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	return recipients, nil
}

func buildRecipientsAllCriteria(
	userIDs []string,
	activity *activityInfo,
	criteriaCodes []string,
) []*interfaces.ActivityNotificationRecipient {
	if criteriaCodes == nil {
		criteriaCodes = []string{}
	}
	recipients := make([]*interfaces.ActivityNotificationRecipient, len(userIDs))
	for i, userID := range userIDs {
		recipients[i] = &interfaces.ActivityNotificationRecipient{
			UserID:        userID,
			ActivityID:    activity.ID,
			ActivitySlug:  activity.Slug,
			ActivityTitle: activity.Title,
			ReviewLevel:   activity.ReviewLevel,
			Criteria:      criteriaCodes,
			EndDate:       activity.EndDate,
		}
	}
	return recipients
}

func (r *NotificationRepository) ListDeadlineSoonActivityIDs(ctx context.Context, days int) ([]string, error) {
	query := `
		SELECT id::text
		FROM activities
		WHERE is_active = TRUE
		  AND end_date = CURRENT_DATE + $1::int
		ORDER BY end_date ASC, created_at DESC`

	rows, err := r.pool.Query(ctx, query, days)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	ids := make([]string, 0)
	for rows.Next() {
		var id string
		if err := rows.Scan(&id); err != nil {
			return nil, err
		}
		ids = append(ids, id)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	return ids, nil
}

func (r *NotificationRepository) ListActiveActivityIDs(ctx context.Context) ([]string, error) {
	query := `
		SELECT id::text
		FROM activities
		WHERE is_active = TRUE
		ORDER BY created_at DESC`

	rows, err := r.pool.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	ids := make([]string, 0)
	for rows.Next() {
		var id string
		if err := rows.Scan(&id); err != nil {
			return nil, err
		}
		ids = append(ids, id)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	return ids, nil
}

func (r *NotificationRepository) MarkRead(ctx context.Context, userID string, notificationID string) (*domain.Notification, error) {
	query := `
		UPDATE notifications
		SET is_read = TRUE
		WHERE id = $1 AND user_id = $2
		RETURNING id, user_id, title, message, type, is_read, data, created_at`

	notification, err := scanNotification(r.pool.QueryRow(ctx, query, notificationID, userID))
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	return notification, nil
}

func (r *NotificationRepository) MarkAllRead(ctx context.Context, userID string) (int64, error) {
	commandTag, err := r.pool.Exec(ctx, `
		UPDATE notifications
		SET is_read = TRUE
		WHERE user_id = $1 AND is_read = FALSE`, userID)
	if err != nil {
		return 0, err
	}

	return commandTag.RowsAffected(), nil
}

type notificationScanner interface {
	Scan(dest ...interface{}) error
}

func scanNotification(scanner notificationScanner) (*domain.Notification, error) {
	var notification domain.Notification
	var dataBytes []byte

	err := scanner.Scan(
		&notification.ID,
		&notification.UserID,
		&notification.Title,
		&notification.Message,
		&notification.Type,
		&notification.IsRead,
		&dataBytes,
		&notification.CreatedAt,
	)
	if err != nil {
		return nil, err
	}

	if len(dataBytes) > 0 {
		if err := json.Unmarshal(dataBytes, &notification.Data); err != nil {
			return nil, err
		}
	}
	if notification.Data == nil {
		notification.Data = map[string]interface{}{}
	}

	return &notification, nil
}
