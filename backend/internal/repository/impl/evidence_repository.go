package impl

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

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
	offset := (page - 1) * pageSize

	baseQuery := `
		SELECT e.id, e.user_id, e.activity_id, e.criteria_doc_id, e.file_url, e.file_key, 
		       e.description, e.status, e.review_note, e.reviewed_by, e.reviewed_at, 
		       e.criterion_type, e.created_at, e.updated_at,
		       a.title as activity_title,
		       cd.title as criteria_doc_title
		FROM evidences e
		LEFT JOIN activities a ON e.activity_id = a.id
		LEFT JOIN criteria_docs cd ON e.criteria_doc_id = cd.id
		WHERE e.user_id = $1`

	args := []interface{}{userID}
	argIndex := 2

	if filter.ActivityID != nil {
		baseQuery += fmt.Sprintf(" AND e.activity_id = $%d", argIndex)
		args = append(args, *filter.ActivityID)
		argIndex++
	}

	if filter.Status != nil {
		baseQuery += fmt.Sprintf(" AND e.status = $%d", argIndex)
		args = append(args, *filter.Status)
		argIndex++
	}

	countQuery := "SELECT COUNT(*) FROM evidences e WHERE e.user_id = $1"
	countArgs := []interface{}{userID}
	countArgIndex := 2

	if filter.ActivityID != nil {
		countQuery += fmt.Sprintf(" AND e.activity_id = $%d", countArgIndex)
		countArgs = append(countArgs, *filter.ActivityID)
		countArgIndex++
	}
	if filter.Status != nil {
		countQuery += fmt.Sprintf(" AND e.status = $%d", countArgIndex)
		countArgs = append(countArgs, *filter.Status)
	}

	var total int
	err := r.pool.QueryRow(ctx, countQuery, countArgs...).Scan(&total)
	if err != nil {
		return nil, err
	}

	baseQuery += fmt.Sprintf(" ORDER BY e.created_at DESC LIMIT $%d OFFSET $%d", argIndex, argIndex+1)
	args = append(args, pageSize, offset)

	rows, err := r.pool.Query(ctx, baseQuery, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var evidences []*domain.Evidence
	for rows.Next() {
		var e domain.Evidence
		var criteriaDocID, description, reviewNote, reviewedBy, criterionType, activityTitle, criteriaDocTitle *string
		var reviewedAt sql.NullTime

		err := rows.Scan(
			&e.ID,
			&e.UserID,
			&e.ActivityID,
			&criteriaDocID,
			&e.FileURL,
			&e.FileKey,
			&description,
			&e.Status,
			&reviewNote,
			&reviewedBy,
			&reviewedAt,
			&criterionType,
			&e.CreatedAt,
			&e.UpdatedAt,
			&activityTitle,
			&criteriaDocTitle,
		)
		if err != nil {
			return nil, err
		}

		e.CriteriaDocID = criteriaDocID
		e.Description = description
		e.ReviewNote = reviewNote
		e.ReviewedBy = reviewedBy
		e.CriterionType = criterionType
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
		SELECT id, user_id, activity_id, criteria_doc_id, file_url, file_key, 
		       description, status, review_note, reviewed_by, reviewed_at, 
		       criterion_type, created_at, updated_at
		FROM evidences WHERE id = $1`

	var e domain.Evidence
	var criteriaDocID, description, reviewNote, reviewedBy, criterionType *string
	var reviewedAt sql.NullTime

	err := r.pool.QueryRow(ctx, query, id).Scan(
		&e.ID,
		&e.UserID,
		&e.ActivityID,
		&criteriaDocID,
		&e.FileURL,
		&e.FileKey,
		&description,
		&e.Status,
		&reviewNote,
		&reviewedBy,
		&reviewedAt,
		&criterionType,
		&e.CreatedAt,
		&e.UpdatedAt,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	e.CriteriaDocID = criteriaDocID
	e.Description = description
	e.ReviewNote = reviewNote
	e.ReviewedBy = reviewedBy
	e.CriterionType = criterionType
	if reviewedAt.Valid {
		e.ReviewedAt = &reviewedAt.Time
	}

	return &e, nil
}

func (r *EvidenceRepository) Create(ctx context.Context, evidence *domain.Evidence) error {
	query := `
		INSERT INTO evidences (user_id, activity_id, criteria_doc_id, file_url, file_key, description, criterion_type)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, created_at, updated_at`

	var criteriaDocID, description, criterionType *string
	if evidence.CriteriaDocID != nil {
		criteriaDocID = evidence.CriteriaDocID
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
		criteriaDocID,
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

func (r *EvidenceRepository) UpdateStatus(ctx context.Context, id string, status string, reviewNote *string, reviewedBy string) error {
	query := `
		UPDATE evidences
		SET status = $1, review_note = $2, reviewed_by = $3, reviewed_at = NOW(), updated_at = NOW()
		WHERE id = $4`

	_, err := r.pool.Exec(ctx, query, status, reviewNote, reviewedBy, id)
	return err
}
