package impl

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"strings"

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
			   e.description, e.status, e.review_note, e.reviewed_by, e.reviewed_at,
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
		var activityCriteriaID, description, reviewNote, reviewedBy, criterionType, activityTitle, reviewLevel, userFullName, userStudentID, userAvatarURL, userUnitID, userUnitName, userClassName *string
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
			   e.description, e.status, e.review_note, e.reviewed_by, e.reviewed_at,
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
	var activityCriteriaID, description, reviewNote, reviewedBy, criterionType, activityTitle, reviewLevel, userFullName, userStudentID, userAvatarURL, userUnitID, userUnitName, userClassName *string
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
		INSERT INTO evidences (user_id, activity_id, activity_criteria_id, file_url, file_key, description, criterion_type)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
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

func (r *EvidenceRepository) UpdateStatus(ctx context.Context, id string, status string, reviewNote *string, reviewedBy string, score *int) error {
	query := `
		UPDATE evidences
		SET status = $1, review_note = $2, reviewed_by = $3, reviewed_at = NOW(), updated_at = NOW(), score = $4
		WHERE id = $5`

	_, err := r.pool.Exec(ctx, query, status, reviewNote, reviewedBy, score, id)
	return err
}

func derefString(value *string) string {
	if value == nil {
		return ""
	}
	return *value
}
