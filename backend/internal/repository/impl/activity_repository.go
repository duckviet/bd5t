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

func (r *ActivityRepository) Create(ctx context.Context, activity *domain.Activity) (*domain.Activity, error) {
	query := `
		INSERT INTO activities (title, description, slug, thumbnail_url, short_description, unit_id, start_date, end_date, is_active, registration_url, review_level, organizer)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
		RETURNING id, created_at, updated_at`

	err := r.pool.QueryRow(ctx, query,
		activity.Title,
		activity.Description,
		activity.Slug,
		activity.ThumbnailURL,
		activity.ShortDescription,
		activity.UnitID,
		activity.StartDate,
		activity.EndDate,
		activity.IsActive,
		activity.RegistrationURL,
		activity.ReviewLevel,
		activity.Organizer,
	).Scan(&activity.ID, &activity.CreatedAt, &activity.UpdatedAt)

	if err != nil {
		return nil, err
	}

	return activity, nil
}

func (r *ActivityRepository) Update(ctx context.Context, id string, activity *domain.Activity) (*domain.Activity, error) {
	query := `
		UPDATE activities
		SET title = $2, description = $3, slug = $4, thumbnail_url = $5, short_description = $6,
		    unit_id = $7, start_date = $8, end_date = $9, is_active = $10, registration_url = $11,
		    review_level = $12, organizer = $13, updated_at = NOW()
		WHERE id = $1
		RETURNING updated_at`

	err := r.pool.QueryRow(ctx, query,
		id,
		activity.Title,
		activity.Description,
		activity.Slug,
		activity.ThumbnailURL,
		activity.ShortDescription,
		activity.UnitID,
		activity.StartDate,
		activity.EndDate,
		activity.IsActive,
		activity.RegistrationURL,
		activity.ReviewLevel,
		activity.Organizer,
	).Scan(&activity.UpdatedAt)

	if err == pgx.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	activity.ID = id
	return activity, nil
}

func (r *ActivityRepository) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM activities WHERE id = $1`
	result, err := r.pool.Exec(ctx, query, id)
	if err != nil {
		return err
	}

	if result.RowsAffected() == 0 {
		return nil
	}

	return nil
}
