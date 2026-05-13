package impl

import (
	"context"
	"fmt"
	"strings"

	"github.com/duckviet/bd5t/backend/internal/domain"
	"github.com/duckviet/bd5t/backend/internal/repository/interfaces"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type ActivityRepository struct {
	pool *pgxpool.Pool
}

func NewActivityRepository(pool *pgxpool.Pool) *ActivityRepository {
	return &ActivityRepository{pool: pool}
}

var _ interfaces.ActivityRepository = (*ActivityRepository)(nil)

func (r *ActivityRepository) List(ctx context.Context, filter *interfaces.ListActivitiesFilter, page, pageSize int) (*interfaces.ListActivitiesResult, error) {
	var conditions []string
	var args []interface{}
	argNum := 1

	if filter != nil {
		if filter.UnitID != nil {
			conditions = append(conditions, fmt.Sprintf("unit_id = $%d", argNum))
			args = append(args, *filter.UnitID)
			argNum++
		}
		if filter.IsActive != nil {
			conditions = append(conditions, fmt.Sprintf("is_active = $%d", argNum))
			args = append(args, *filter.IsActive)
			argNum++
		}
	}

	whereClause := ""
	if len(conditions) > 0 {
		whereClause = "WHERE " + strings.Join(conditions, " AND ")
	}

	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM activities %s", whereClause)
	var total int64
	err := r.pool.QueryRow(ctx, countQuery, args...).Scan(&total)
	if err != nil {
		return nil, err
	}

	offset := (page - 1) * pageSize
	query := fmt.Sprintf(`
		SELECT id, title, description, slug, thumbnail_url, short_description, 
		       unit_id, start_date, end_date, is_active, registration_url, 
		       review_level, organizer, created_at, updated_at
		FROM activities
		%s
		ORDER BY created_at DESC
		LIMIT $%d OFFSET $%d`, whereClause, argNum, argNum+1)

	args = append(args, pageSize, offset)

	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var activities []*domain.Activity
	for rows.Next() {
		var a domain.Activity
		err := rows.Scan(
			&a.ID,
			&a.Title,
			&a.Description,
			&a.Slug,
			&a.ThumbnailURL,
			&a.ShortDescription,
			&a.UnitID,
			&a.StartDate,
			&a.EndDate,
			&a.IsActive,
			&a.RegistrationURL,
			&a.ReviewLevel,
			&a.Organizer,
			&a.CreatedAt,
			&a.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		activities = append(activities, &a)
	}

	return &interfaces.ListActivitiesResult{
		Activities: activities,
		Total:      total,
	}, nil
}

func (r *ActivityRepository) GetBySlug(ctx context.Context, slug string) (*domain.Activity, error) {
	query := `
		SELECT id, title, description, slug, thumbnail_url, short_description,
		       unit_id, start_date, end_date, is_active, registration_url,
		       review_level, organizer, created_at, updated_at
		FROM activities
		WHERE slug = $1`

	var a domain.Activity
	err := r.pool.QueryRow(ctx, query, slug).Scan(
		&a.ID,
		&a.Title,
		&a.Description,
		&a.Slug,
		&a.ThumbnailURL,
		&a.ShortDescription,
		&a.UnitID,
		&a.StartDate,
		&a.EndDate,
		&a.IsActive,
		&a.RegistrationURL,
		&a.ReviewLevel,
		&a.Organizer,
		&a.CreatedAt,
		&a.UpdatedAt,
	)
	if err == pgx.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	return &a, nil
}

func (r *ActivityRepository) GetByID(ctx context.Context, id string) (*domain.Activity, error) {
	query := `
		SELECT id, title, description, slug, thumbnail_url, short_description,
		       unit_id, start_date, end_date, is_active, registration_url,
		       review_level, organizer, created_at, updated_at
		FROM activities
		WHERE id = $1`

	var a domain.Activity
	err := r.pool.QueryRow(ctx, query, id).Scan(
		&a.ID,
		&a.Title,
		&a.Description,
		&a.Slug,
		&a.ThumbnailURL,
		&a.ShortDescription,
		&a.UnitID,
		&a.StartDate,
		&a.EndDate,
		&a.IsActive,
		&a.RegistrationURL,
		&a.ReviewLevel,
		&a.Organizer,
		&a.CreatedAt,
		&a.UpdatedAt,
	)
	if err == pgx.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	return &a, nil
}

func (r *ActivityRepository) GetCriteriaDocsByActivityID(ctx context.Context, activityID string) ([]*domain.CriteriaDoc, error) {
	query := `
		SELECT id, activity_id, title, description, max_score, created_at, updated_at
		FROM criteria_docs
		WHERE activity_id = $1
		ORDER BY created_at ASC`

	rows, err := r.pool.Query(ctx, query, activityID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var criteria []*domain.CriteriaDoc
	for rows.Next() {
		var c domain.CriteriaDoc
		err := rows.Scan(
			&c.ID,
			&c.ActivityID,
			&c.Title,
			&c.Description,
			&c.MaxScore,
			&c.CreatedAt,
			&c.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		criteria = append(criteria, &c)
	}

	return criteria, nil
}
