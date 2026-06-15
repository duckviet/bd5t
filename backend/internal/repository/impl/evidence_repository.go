package impl

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/duckviet/bd5t/backend/internal/domain"
	"github.com/duckviet/bd5t/backend/internal/repository/interfaces"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type EvidenceRepository struct {
	pool *pgxpool.Pool
}

func NewEvidenceRepository(pool *pgxpool.Pool) *EvidenceRepository {
	return &EvidenceRepository{pool: pool}
}

var _ interfaces.EvidenceRepository = (*EvidenceRepository)(nil)

func (r *EvidenceRepository) List(ctx context.Context, userID string, filter interfaces.EvidenceFilter, page, pageSize int) (*interfaces.EvidenceListResult, error) {
	return r.list(ctx, &userID, filter, page, pageSize)
}

func (r *EvidenceRepository) ListAll(ctx context.Context, filter interfaces.EvidenceFilter, page, pageSize int) (*interfaces.EvidenceListResult, error) {
	return r.list(ctx, nil, filter, page, pageSize)
}

func (r *EvidenceRepository) GetStats(ctx context.Context) (*interfaces.EvidenceStats, error) {
	query := `
		SELECT
			COUNT(*) FILTER (WHERE status = 'pending') AS pending,
			COUNT(*) FILTER (WHERE status = 'approved' AND reviewed_at::date = CURRENT_DATE) AS approved_today,
			COUNT(*) FILTER (WHERE status = 'rejected' AND reviewed_at::date = CURRENT_DATE) AS rejected_today,
			COUNT(*) AS total
		FROM evidences`

	var stats interfaces.EvidenceStats
	if err := r.pool.QueryRow(ctx, query).Scan(
		&stats.Pending,
		&stats.ApprovedToday,
		&stats.RejectedToday,
		&stats.Total,
	); err != nil {
		return nil, err
	}

	return &stats, nil
}

func (r *EvidenceRepository) list(ctx context.Context, userID *string, filter interfaces.EvidenceFilter, page, pageSize int) (*interfaces.EvidenceListResult, error) {
	offset := (page - 1) * pageSize

	selectQuery := `
		SELECT e.id, e.user_id, e.activity_id, e.activity_criteria_id, e.score, e.file_url, e.file_key,
			   e.description, e.status, e.review_note, e.reviewed_by, e.reviewed_at, e.award_level,
			   COALESCE(e.criterion_type, selected_c.code, activity_codes.criteria[1]) as criterion_type,
			   COALESCE(
				   CASE
					   WHEN e.criterion_type IS NOT NULL THEN ARRAY[e.criterion_type]
					   WHEN selected_c.code IS NOT NULL THEN ARRAY[selected_c.code]
					   ELSE activity_codes.criteria
				   END,
				   '{}'
			   ) as criteria,
			   e.created_at, e.updated_at,
			   a.title as activity_title,
			   a.review_level as review_level,
			   u.display_name as user_full_name,
			   u.student_id as user_student_id,
			   u.avatar_url as user_avatar_url,
			   u.unit_id::text as user_unit_id,
			   un.name as user_unit_name,
			   u.class_name as user_class_name
	`
	fromQuery := `
		FROM evidences e
		LEFT JOIN activities a ON e.activity_id = a.id
		LEFT JOIN users u ON e.user_id = u.id
		LEFT JOIN units un ON u.unit_id = un.id
		LEFT JOIN activity_criteria selected_ac ON e.activity_criteria_id = selected_ac.id
		LEFT JOIN criteria selected_c ON selected_ac.criteria_id = selected_c.id
		LEFT JOIN LATERAL (
			SELECT COALESCE(array_agg(c.code ORDER BY c.code) FILTER (WHERE c.code IS NOT NULL), '{}') as criteria
			FROM activity_criteria ac
			JOIN criteria c ON ac.criteria_id = c.id
			WHERE ac.activity_id = e.activity_id
		) activity_codes ON TRUE
	`

	args := []interface{}{}
	argIndex := 1
	whereParts := []string{"1 = 1"}

	if userID != nil {
		whereParts = append(whereParts, fmt.Sprintf("e.user_id = $%d", argIndex))
		args = append(args, *userID)
		argIndex++
	}

	if filter.ActivityID != nil {
		whereParts = append(whereParts, fmt.Sprintf("e.activity_id = $%d", argIndex))
		args = append(args, *filter.ActivityID)
		argIndex++
	}

	if filter.Status != nil {
		whereParts = append(whereParts, fmt.Sprintf("e.status = $%d", argIndex))
		args = append(args, *filter.Status)
		argIndex++
	}
	if filter.Search != nil && strings.TrimSpace(*filter.Search) != "" {
		whereParts = append(whereParts, fmt.Sprintf(`(
			a.title ILIKE $%d OR
			e.description ILIKE $%d OR
			u.display_name ILIKE $%d OR
			u.student_id ILIKE $%d
		)`, argIndex, argIndex, argIndex, argIndex))
		args = append(args, "%"+strings.TrimSpace(*filter.Search)+"%")
		argIndex++
	}
	if filter.Criteria != nil && strings.TrimSpace(*filter.Criteria) != "" {
		whereParts = append(whereParts, fmt.Sprintf(`(
			e.criterion_type = $%d OR
			selected_c.code = $%d OR
			$%d = ANY(activity_codes.criteria)
		)`, argIndex, argIndex, argIndex))
		args = append(args, strings.TrimSpace(*filter.Criteria))
		argIndex++
	}
	if filter.SubmittedFrom != nil && strings.TrimSpace(*filter.SubmittedFrom) != "" {
		whereParts = append(whereParts, fmt.Sprintf("e.created_at >= $%d::date", argIndex))
		args = append(args, strings.TrimSpace(*filter.SubmittedFrom))
		argIndex++
	}
	if filter.SubmittedTo != nil && strings.TrimSpace(*filter.SubmittedTo) != "" {
		whereParts = append(whereParts, fmt.Sprintf("e.created_at < ($%d::date + INTERVAL '1 day')", argIndex))
		args = append(args, strings.TrimSpace(*filter.SubmittedTo))
		argIndex++
	}
	if filter.UnitID != nil && strings.TrimSpace(*filter.UnitID) != "" {
		whereParts = append(whereParts, fmt.Sprintf("u.unit_id = $%d", argIndex))
		args = append(args, strings.TrimSpace(*filter.UnitID))
		argIndex++
	}
	if filter.ClassName != nil && strings.TrimSpace(*filter.ClassName) != "" {
		whereParts = append(whereParts, fmt.Sprintf("u.class_name ILIKE $%d", argIndex))
		args = append(args, "%"+strings.TrimSpace(*filter.ClassName)+"%")
		argIndex++
	}

	whereQuery := " WHERE " + strings.Join(whereParts, " AND ")
	countQuery := "SELECT COUNT(*) " + fromQuery + whereQuery

	var total int
	err := r.pool.QueryRow(ctx, countQuery, args...).Scan(&total)
	if err != nil {
		return nil, err
	}

	orderBy := " ORDER BY e.created_at DESC"
	if filter.Sort != nil {
		switch *filter.Sort {
		case "createdAt_asc":
			orderBy = " ORDER BY e.created_at ASC"
		case "priority":
			orderBy = " ORDER BY CASE WHEN e.status = 'pending' THEN 0 ELSE 1 END, e.created_at DESC"
		}
	}

	baseQuery := selectQuery + fromQuery + whereQuery + orderBy + fmt.Sprintf(" LIMIT $%d OFFSET $%d", argIndex, argIndex+1)
	args = append(args, pageSize, offset)

	rows, err := r.pool.Query(ctx, baseQuery, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var evidences []*domain.Evidence
	for rows.Next() {
		var e domain.Evidence
		var activityCriteriaID, description, reviewNote, reviewedBy, awardLevel, criterionType, activityTitle, reviewLevel, userFullName, userStudentID, userAvatarURL, userUnitID, userUnitName, userClassName *string
		var criteria []string
		var score sql.NullInt64
		var reviewedAt sql.NullTime

		err := rows.Scan(
			&e.ID,
			&e.UserID,
			&e.ActivityID,
			&activityCriteriaID,
			&score,
			&e.FileURL,
			&e.FileKey,
			&description,
			&e.Status,
			&reviewNote,
			&reviewedBy,
			&reviewedAt,
			&awardLevel,
			&criterionType,
			&criteria,
			&e.CreatedAt,
			&e.UpdatedAt,
			&activityTitle,
			&reviewLevel,
			&userFullName,
			&userStudentID,
			&userAvatarURL,
			&userUnitID,
			&userUnitName,
			&userClassName,
		)
		if err != nil {
			return nil, err
		}
		e.ActivityCriteriaID = activityCriteriaID
		if score.Valid {
			v := int(score.Int64)
			e.Score = &v
		}
		e.Description = description
		e.ReviewNote = reviewNote
		e.ReviewedBy = reviewedBy
		e.AwardLevel = awardLevel
		e.CriterionType = criterionType
		e.Criteria = criteria
		e.ActivityTitle = derefString(activityTitle)
		e.ReviewLevel = reviewLevel
		e.UserFullName = userFullName
		e.UserStudentID = userStudentID
		e.UserAvatarURL = userAvatarURL
		e.UserUnitID = userUnitID
		e.UserUnitName = userUnitName
		e.UserClassName = userClassName
		if reviewedAt.Valid {
			e.ReviewedAt = &reviewedAt.Time
		}

		evidences = append(evidences, &e)
	}

	return &interfaces.EvidenceListResult{
		Evidences: evidences,
		Total:     total,
	}, nil
}

func (r *EvidenceRepository) GetByID(ctx context.Context, id string) (*domain.Evidence, error) {
	query := `
		SELECT e.id, e.user_id, e.activity_id, e.activity_criteria_id, e.score, e.file_url, e.file_key,
			   e.description, e.status, e.review_note, e.reviewed_by, e.reviewed_at, e.award_level,
			   COALESCE(e.criterion_type, selected_c.code, activity_codes.criteria[1]) as criterion_type,
			   COALESCE(
				   CASE
					   WHEN e.criterion_type IS NOT NULL THEN ARRAY[e.criterion_type]
					   WHEN selected_c.code IS NOT NULL THEN ARRAY[selected_c.code]
					   ELSE activity_codes.criteria
				   END,
				   '{}'
			   ) as criteria,
			   e.created_at, e.updated_at,
			   a.title as activity_title,
			   a.review_level as review_level,
			   u.display_name as user_full_name,
			   u.student_id as user_student_id,
			   u.avatar_url as user_avatar_url,
			   u.unit_id::text as user_unit_id,
			   un.name as user_unit_name,
			   u.class_name as user_class_name
		FROM evidences e
		LEFT JOIN activities a ON e.activity_id = a.id
		LEFT JOIN users u ON e.user_id = u.id
		LEFT JOIN units un ON u.unit_id = un.id
		LEFT JOIN activity_criteria selected_ac ON e.activity_criteria_id = selected_ac.id
		LEFT JOIN criteria selected_c ON selected_ac.criteria_id = selected_c.id
		LEFT JOIN LATERAL (
			SELECT COALESCE(array_agg(c.code ORDER BY c.code) FILTER (WHERE c.code IS NOT NULL), '{}') as criteria
			FROM activity_criteria ac
			JOIN criteria c ON ac.criteria_id = c.id
			WHERE ac.activity_id = e.activity_id
		) activity_codes ON TRUE
		WHERE e.id = $1`

	var e domain.Evidence
	var activityCriteriaID, description, reviewNote, reviewedBy, awardLevel, criterionType, activityTitle, reviewLevel, userFullName, userStudentID, userAvatarURL, userUnitID, userUnitName, userClassName *string
	var criteria []string
	var score sql.NullInt64
	var reviewedAt sql.NullTime

	err := r.pool.QueryRow(ctx, query, id).Scan(
		&e.ID,
		&e.UserID,
		&e.ActivityID,
		&activityCriteriaID,
		&score,
		&e.FileURL,
		&e.FileKey,
		&description,
		&e.Status,
		&reviewNote,
		&reviewedBy,
		&reviewedAt,
		&awardLevel,
		&criterionType,
		&criteria,
		&e.CreatedAt,
		&e.UpdatedAt,
		&activityTitle,
		&reviewLevel,
		&userFullName,
		&userStudentID,
		&userAvatarURL,
		&userUnitID,
		&userUnitName,
		&userClassName,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	e.ActivityCriteriaID = activityCriteriaID
	if score.Valid {
		v := int(score.Int64)
		e.Score = &v
	}
	e.Description = description
	e.ReviewNote = reviewNote
	e.ReviewedBy = reviewedBy
	e.AwardLevel = awardLevel
	e.CriterionType = criterionType
	e.Criteria = criteria
	e.ActivityTitle = derefString(activityTitle)
	e.ReviewLevel = reviewLevel
	e.UserFullName = userFullName
	e.UserStudentID = userStudentID
	e.UserAvatarURL = userAvatarURL
	e.UserUnitID = userUnitID
	e.UserUnitName = userUnitName
	e.UserClassName = userClassName
	if reviewedAt.Valid {
		e.ReviewedAt = &reviewedAt.Time
	}

	return &e, nil
}

func (r *EvidenceRepository) Create(ctx context.Context, evidence *domain.Evidence) error {
	query := `
		INSERT INTO evidences (user_id, activity_id, activity_criteria_id, file_url, file_key, description, criterion_type, award_level)
		VALUES ($1, $2, $3, $4, $5, $6, $7, NULL)
		RETURNING id, created_at, updated_at`

	var activityCriteriaID, description, criterionType *string
	if evidence.ActivityCriteriaID != nil {
		activityCriteriaID = evidence.ActivityCriteriaID
	}
	if evidence.Description != nil {
		description = evidence.Description
	}
	if evidence.CriterionType != nil {
		criterionType = evidence.CriterionType
	}

	return r.pool.QueryRow(ctx, query,
		evidence.UserID,
		evidence.ActivityID,
		activityCriteriaID,
		evidence.FileURL,
		evidence.FileKey,
		description,
		criterionType,
	).Scan(&evidence.ID, &evidence.CreatedAt, &evidence.UpdatedAt)
}

func (r *EvidenceRepository) ListAwardEvidences(ctx context.Context, filter interfaces.AwardEvidenceFilter, page, pageSize int) (*interfaces.EvidenceListResult, error) {
	offset := (page - 1) * pageSize

	selectQuery := `
		SELECT e.id, e.user_id, e.activity_id, e.activity_criteria_id, e.score, e.file_url, e.file_key,
			   e.description, e.status, e.review_note, e.reviewed_by, e.reviewed_at, e.award_level,
			   COALESCE(e.criterion_type, selected_c.code, activity_codes.criteria[1]) as criterion_type,
			   COALESCE(
				   CASE
					   WHEN e.criterion_type IS NOT NULL THEN ARRAY[e.criterion_type]
					   WHEN selected_c.code IS NOT NULL THEN ARRAY[selected_c.code]
					   ELSE activity_codes.criteria
				   END,
				   '{}'
			   ) as criteria,
			   e.created_at, e.updated_at,
			   a.title as activity_title,
			   a.review_level as review_level,
			   u.display_name as user_full_name,
			   u.student_id as user_student_id,
			   u.avatar_url as user_avatar_url,
			   u.unit_id::text as user_unit_id,
			   un.name as user_unit_name,
			   u.class_name as user_class_name
	`
	fromQuery := `
		FROM evidences e
		LEFT JOIN activities a ON e.activity_id = a.id
		LEFT JOIN users u ON e.user_id = u.id
		LEFT JOIN units un ON u.unit_id = un.id
		LEFT JOIN activity_criteria selected_ac ON e.activity_criteria_id = selected_ac.id
		LEFT JOIN criteria selected_c ON selected_ac.criteria_id = selected_c.id
		LEFT JOIN LATERAL (
			SELECT COALESCE(array_agg(c.code ORDER BY c.code) FILTER (WHERE c.code IS NOT NULL), '{}') as criteria
			FROM activity_criteria ac
			JOIN criteria c ON ac.criteria_id = c.id
			WHERE ac.activity_id = e.activity_id
		) activity_codes ON TRUE
	`

	args := []interface{}{}
	argIndex := 1
	whereParts := []string{"e.status = 'approved'"}

	if filter.AwardLevel != nil && *filter.AwardLevel != "" {
		if *filter.AwardLevel == "NONE" {
			whereParts = append(whereParts, fmt.Sprintf("(e.award_level IS NULL OR e.award_level = $%d)", argIndex))
		} else {
			whereParts = append(whereParts, fmt.Sprintf("e.award_level = $%d", argIndex))
		}
		args = append(args, *filter.AwardLevel)
		argIndex++
	}
	if filter.UnitID != nil && *filter.UnitID != "" {
		whereParts = append(whereParts, fmt.Sprintf("u.unit_id = $%d", argIndex))
		args = append(args, *filter.UnitID)
		argIndex++
	}
	if filter.ActivityID != nil && *filter.ActivityID != "" {
		whereParts = append(whereParts, fmt.Sprintf("e.activity_id = $%d", argIndex))
		args = append(args, *filter.ActivityID)
		argIndex++
	}
	if filter.Search != nil && strings.TrimSpace(*filter.Search) != "" {
		whereParts = append(whereParts, fmt.Sprintf(`(
			a.title ILIKE $%d OR
			u.display_name ILIKE $%d OR
			u.student_id ILIKE $%d
		)`, argIndex, argIndex, argIndex))
		args = append(args, "%"+strings.TrimSpace(*filter.Search)+"%")
		argIndex++
	}

	whereQuery := " WHERE " + strings.Join(whereParts, " AND ")
	countQuery := "SELECT COUNT(*) " + fromQuery + whereQuery

	var total int
	err := r.pool.QueryRow(ctx, countQuery, args...).Scan(&total)
	if err != nil {
		return nil, err
	}

	baseQuery := selectQuery + fromQuery + whereQuery + " ORDER BY e.updated_at DESC" +
		fmt.Sprintf(" LIMIT $%d OFFSET $%d", argIndex, argIndex+1)
	args = append(args, pageSize, offset)

	rows, err := r.pool.Query(ctx, baseQuery, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var evidences []*domain.Evidence
	for rows.Next() {
		var e domain.Evidence
		var activityCriteriaID, description, reviewNote, reviewedBy, awardLevel, criterionType, activityTitle, reviewLevel, userFullName, userStudentID, userAvatarURL, userUnitID, userUnitName, userClassName *string
		var criteria []string
		var score sql.NullInt64
		var reviewedAt sql.NullTime

		err := rows.Scan(
			&e.ID, &e.UserID, &e.ActivityID, &activityCriteriaID, &score,
			&e.FileURL, &e.FileKey, &description, &e.Status, &reviewNote,
			&reviewedBy, &reviewedAt, &awardLevel, &criterionType, &criteria,
			&e.CreatedAt, &e.UpdatedAt, &activityTitle, &reviewLevel,
			&userFullName, &userStudentID, &userAvatarURL, &userUnitID,
			&userUnitName, &userClassName,
		)
		if err != nil {
			return nil, err
		}
		e.ActivityCriteriaID = activityCriteriaID
		if score.Valid {
			v := int(score.Int64)
			e.Score = &v
		}
		e.Description = description
		e.ReviewNote = reviewNote
		e.ReviewedBy = reviewedBy
		e.AwardLevel = awardLevel
		e.CriterionType = criterionType
		e.Criteria = criteria
		e.ActivityTitle = derefString(activityTitle)
		e.ReviewLevel = reviewLevel
		e.UserFullName = userFullName
		e.UserStudentID = userStudentID
		e.UserAvatarURL = userAvatarURL
		e.UserUnitID = userUnitID
		e.UserUnitName = userUnitName
		e.UserClassName = userClassName
		if reviewedAt.Valid {
			e.ReviewedAt = &reviewedAt.Time
		}
		evidences = append(evidences, &e)
	}

	return &interfaces.EvidenceListResult{
		Evidences: evidences,
		Total:     total,
	}, nil
}

func (r *EvidenceRepository) ListAwardActivities(ctx context.Context, search *string, page, pageSize int) ([]*domain.AwardActivityOverview, int, error) {
	offset := (page - 1) * pageSize

	// Query 1: get paginated activities with aggregated award stats
	args := []interface{}{}
	argIndex := 1
	whereParts := []string{"e.status = 'approved'"}
	if search != nil && *search != "" {
		whereParts = append(whereParts, fmt.Sprintf("a.title ILIKE $%d", argIndex))
		args = append(args, "%"+*search+"%")
		argIndex++
	}
	whereQuery := " WHERE " + strings.Join(whereParts, " AND ")

	activitySelect := fmt.Sprintf(`
		SELECT a.id, a.title, a.review_level,
			COALESCE((SELECT array_agg(DISTINCT c.code) FROM activity_criteria ac2 JOIN criteria c ON c.id = ac2.criteria_id WHERE ac2.activity_id = a.id), '{}') as criteria,
			COUNT(DISTINCT e.user_id) as student_count,
			COUNT(*) FILTER (WHERE e.award_level = 'NHAT') as cnt_nhat,
			COUNT(*) FILTER (WHERE e.award_level = 'NHI') as cnt_nhi,
			COUNT(*) FILTER (WHERE e.award_level = 'BA') as cnt_ba,
			COUNT(*) FILTER (WHERE e.award_level = 'KHUYEN_KHICH') as cnt_khuyen_khich,
			COUNT(*) FILTER (WHERE e.award_level IS NULL OR e.award_level = 'NONE') as cnt_none
		FROM activities a
		JOIN evidences e ON e.activity_id = a.id %s
		GROUP BY a.id`, whereQuery)

	countQuery := "SELECT COUNT(*) FROM (" + activitySelect + ") t"
	var total int
	if err := r.pool.QueryRow(ctx, countQuery, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	activityQuery := activitySelect + fmt.Sprintf(" ORDER BY a.title LIMIT $%d OFFSET $%d", argIndex, argIndex+1)
	args = append(args, pageSize, offset)

	rows, err := r.pool.Query(ctx, activityQuery, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	type activityRow struct {
		id             string
		title          string
		reviewLevel    *string
		criteria       []string
		studentCount   int
		cntNhat        int
		cntNhi         int
		cntBa          int
		cntKhuyenKhich int
		cntNone        int
	}

	var activityRows []activityRow
	var activityIDs []string
	for rows.Next() {
		var r activityRow
		if err := rows.Scan(&r.id, &r.title, &r.reviewLevel, &r.criteria, &r.studentCount,
			&r.cntNhat, &r.cntNhi, &r.cntBa, &r.cntKhuyenKhich, &r.cntNone); err != nil {
			return nil, 0, err
		}
		activityRows = append(activityRows, r)
		activityIDs = append(activityIDs, r.id)
	}

	if len(activityIDs) == 0 {
		return []*domain.AwardActivityOverview{}, total, nil
	}

	// Query 2: get all approved evidences with user info for these activities
	evidenceArgs := []interface{}{}
	evidencePlaceholders := make([]string, len(activityIDs))
	for i, id := range activityIDs {
		evidencePlaceholders[i] = fmt.Sprintf("$%d", i+1)
		evidenceArgs = append(evidenceArgs, id)
	}

	evidenceQuery := fmt.Sprintf(`
		SELECT e.id, e.user_id, e.activity_id, e.score, e.award_level,
			   COALESCE(e.criterion_type, selected_c.code, activity_codes.criteria[1]) as criterion_type,
			   e.file_url, e.description, e.created_at,
			   u.display_name, u.student_id, u.class_name
		FROM evidences e
		JOIN users u ON u.id = e.user_id
		LEFT JOIN activity_criteria selected_ac ON e.activity_criteria_id = selected_ac.id
		LEFT JOIN criteria selected_c ON selected_ac.criteria_id = selected_c.id
		LEFT JOIN LATERAL (
			SELECT COALESCE(array_agg(c.code ORDER BY c.code) FILTER (WHERE c.code IS NOT NULL), '{}') as criteria
			FROM activity_criteria ac
			JOIN criteria c ON ac.criteria_id = c.id
			WHERE ac.activity_id = e.activity_id
		) activity_codes ON TRUE
		WHERE e.activity_id IN (%s) AND e.status = 'approved'
		ORDER BY e.activity_id, u.display_name, e.created_at`,
		strings.Join(evidencePlaceholders, ","))

	evidenceRows, err := r.pool.Query(ctx, evidenceQuery, evidenceArgs...)
	if err != nil {
		return nil, 0, err
	}
	defer evidenceRows.Close()

	type evidenceRow struct {
		id            string
		userID        string
		activityID    string
		score         *int
		awardLevel    *string
		criterionType *string
		fileURL       *string
		description   *string
		createdAt     *time.Time
		userName      *string
		studentID     *string
		className     *string
	}

	var evidenceRowsData []evidenceRow
	for evidenceRows.Next() {
		var er evidenceRow
		var score sql.NullInt64
		var createdAt sql.NullTime
		if err := evidenceRows.Scan(&er.id, &er.userID, &er.activityID, &score, &er.awardLevel, &er.criterionType,
			&er.fileURL, &er.description, &createdAt,
			&er.userName, &er.studentID, &er.className); err != nil {
			return nil, 0, err
		}
		if score.Valid {
			v := int(score.Int64)
			er.score = &v
		}
		if createdAt.Valid {
			er.createdAt = &createdAt.Time
		}
		evidenceRowsData = append(evidenceRowsData, er)
	}

	// Aggregate: group evidences by activity → by user
	activityEvidences := make(map[string]map[string][]domain.AwardStudentEvidence) // activityID → userID → evidences
	for _, er := range evidenceRowsData {
		if activityEvidences[er.activityID] == nil {
			activityEvidences[er.activityID] = make(map[string][]domain.AwardStudentEvidence)
		}
		criterionType := ""
		if er.criterionType != nil {
			criterionType = *er.criterionType
		}
		activityEvidences[er.activityID][er.userID] = append(
			activityEvidences[er.activityID][er.userID],
			domain.AwardStudentEvidence{
				EvidenceID:  er.id,
				Criteria:    criterionType,
				AwardLevel:  er.awardLevel,
				Score:       er.score,
				FileURL:     er.fileURL,
				Description: er.description,
				CreatedAt:   er.createdAt,
			},
		)
	}

	// Build results
	type userMeta struct {
		userID    string
		fullName  *string
		studentID *string
		className *string
	}

	userMetas := make(map[string]userMeta)
	for _, er := range evidenceRowsData {
		key := er.activityID + "|" + er.userID
		if _, ok := userMetas[key]; !ok {
			userMetas[key] = userMeta{
				userID:    er.userID,
				fullName:  er.userName,
				studentID: er.studentID,
				className: er.className,
			}
		}
	}

	results := make([]*domain.AwardActivityOverview, len(activityRows))
	for i, ar := range activityRows {
		studentsMap := activityEvidences[ar.id]
		students := make([]domain.AwardStudentDetail, 0, len(studentsMap))
		for userID, evs := range studentsMap {
			meta := userMetas[ar.id+"|"+userID]
			students = append(students, domain.AwardStudentDetail{
				UserID:        meta.userID,
				UserFullName:  meta.fullName,
				UserStudentID: meta.studentID,
				ClassName:     meta.className,
				Evidences:     evs,
			})
		}

		results[i] = &domain.AwardActivityOverview{
			ActivityID:    ar.id,
			ActivityTitle: ar.title,
			ReviewLevel:   ar.reviewLevel,
			Criteria:      ar.criteria,
			TotalStudents: ar.studentCount,
			AwardStats: domain.AwardStats{
				Nhat:        ar.cntNhat,
				Nhi:         ar.cntNhi,
				Ba:          ar.cntBa,
				KhuyenKhich: ar.cntKhuyenKhich,
				None:        ar.cntNone,
			},
			Students: students,
		}
	}

	return results, total, nil
}

func (r *EvidenceRepository) BulkUpdateAwardLevel(ctx context.Context, ids []string, awardLevel *string) error {
	if len(ids) == 0 {
		return nil
	}

	args := []interface{}{awardLevel}
	placeholders := make([]string, len(ids))
	for i, id := range ids {
		placeholders[i] = fmt.Sprintf("$%d", i+2)
		args = append(args, id)
	}

	query := fmt.Sprintf(`
		UPDATE evidences
		SET award_level = $1, updated_at = NOW()
		WHERE id IN (%s) AND status = 'approved'`,
		strings.Join(placeholders, ","))

	_, err := r.pool.Exec(ctx, query, args...)
	return err
}

func (r *EvidenceRepository) Delete(ctx context.Context, id string) error {
	result, err := r.pool.Exec(ctx, "DELETE FROM evidences WHERE id = $1", id)
	if err != nil {
		return err
	}
	if result.RowsAffected() == 0 {
		return pgx.ErrNoRows
	}
	return nil
}

func (r *EvidenceRepository) UpdateStatus(ctx context.Context, id string, status string, reviewNote *string, reviewedBy string, score *int, awardLevel *string) error {
	query := `
		UPDATE evidences
		SET status = $1, review_note = $2, reviewed_by = $3, reviewed_at = NOW(), updated_at = NOW(), score = $4, award_level = $5
		WHERE id = $6`

	_, err := r.pool.Exec(ctx, query, status, reviewNote, reviewedBy, score, awardLevel, id)
	return err
}

func derefString(value *string) string {
	if value == nil {
		return ""
	}
	return *value
}
