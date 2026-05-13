package impl

import (
	"context"
	"encoding/json"

	"github.com/duckviet/bd5t/backend/internal/domain"
	"github.com/duckviet/bd5t/backend/internal/repository/interfaces"
	"github.com/jackc/pgx/v5/pgxpool"
)

type ProgressRepository struct {
	pool *pgxpool.Pool
}

func NewProgressRepository(pool *pgxpool.Pool) *ProgressRepository {
	return &ProgressRepository{pool: pool}
}

var _ interfaces.ProgressRepository = (*ProgressRepository)(nil)

func (r *ProgressRepository) GetByUserID(ctx context.Context, userID string) ([]*domain.Progress, error) {
	query := `
		SELECT id, user_id, activity_id, total_score, completed_criteria, updated_at
		FROM progress
		WHERE user_id = $1
		ORDER BY activity_id`

	rows, err := r.pool.Query(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []*domain.Progress
	for rows.Next() {
		var p domain.Progress
		var completedCriteriaJSON []byte

		err := rows.Scan(
			&p.ID,
			&p.UserID,
			&p.ActivityID,
			&p.TotalScore,
			&completedCriteriaJSON,
			&p.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}

		if len(completedCriteriaJSON) > 0 {
			var criteria []domain.CompletedCriteria
			if err := json.Unmarshal(completedCriteriaJSON, &criteria); err == nil {
				p.CompletedCriteria = criteria
			}
		}

		results = append(results, &p)
	}

	return results, nil
}

func (r *ProgressRepository) GetByUserIDAndActivityID(ctx context.Context, userID, activityID string) (*domain.Progress, error) {
	query := `
		SELECT id, user_id, activity_id, total_score, completed_criteria, updated_at
		FROM progress
		WHERE user_id = $1 AND activity_id = $2`

	var p domain.Progress
	var completedCriteriaJSON []byte

	err := r.pool.QueryRow(ctx, query, userID, activityID).Scan(
		&p.ID,
		&p.UserID,
		&p.ActivityID,
		&p.TotalScore,
		&completedCriteriaJSON,
		&p.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	if len(completedCriteriaJSON) > 0 {
		var criteria []domain.CompletedCriteria
		if err := json.Unmarshal(completedCriteriaJSON, &criteria); err == nil {
			p.CompletedCriteria = criteria
		}
	}

	return &p, nil
}

func (r *ProgressRepository) Upsert(ctx context.Context, progress *domain.Progress) error {
	completedCriteriaJSON, _ := json.Marshal(progress.CompletedCriteria)

	query := `
		INSERT INTO progress (user_id, activity_id, total_score, completed_criteria)
		VALUES ($1, $2, $3, $4)
		ON CONFLICT (user_id, activity_id) 
		DO UPDATE SET total_score = $3, completed_criteria = $4, updated_at = NOW()
		RETURNING id, updated_at`

	return r.pool.QueryRow(ctx, query,
		progress.UserID,
		progress.ActivityID,
		progress.TotalScore,
		completedCriteriaJSON,
	).Scan(&progress.ID, &progress.UpdatedAt)
}

func (r *ProgressRepository) DeleteByUserID(ctx context.Context, userID string) error {
	_, err := r.pool.Exec(ctx, "DELETE FROM progress WHERE user_id = $1", userID)
	return err
}
