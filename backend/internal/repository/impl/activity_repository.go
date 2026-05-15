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
			conditions = append(conditions, fmt.Sprintf("a.unit_id = $%d", argNum))
			args = append(args, *filter.UnitID)
			argNum++
		}
		if filter.IsActive != nil {
			conditions = append(conditions, fmt.Sprintf("a.is_active = $%d", argNum))
			args = append(args, *filter.IsActive)
			argNum++
		}
	}

	whereClause := ""
	if len(conditions) > 0 {
		whereClause = "WHERE " + strings.Join(conditions, " AND ")
	}

	countWhereClause := ""
	if len(conditions) > 0 {
		countWhereClause = "WHERE " + strings.Join(conditions, " AND ")
	}

	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM activities a %s", countWhereClause)
	var total int64
	err := r.pool.QueryRow(ctx, countQuery, args...).Scan(&total)
	if err != nil {
		return nil, err
	}

	offset := (page - 1) * pageSize
	query := fmt.Sprintf(`
		SELECT a.id, a.title, a.description, a.slug, a.thumbnail_url, a.short_description, 
		       a.location, a.target_audience, a.rules, a.rewards, a.contact_info,
		       a.unit_id, a.start_date, a.end_date, a.is_active, a.registration_url, 
		       a.review_level, a.organizer, a.created_at, a.updated_at,
		       COALESCE(array_agg(c.code) FILTER (WHERE c.code IS NOT NULL), '{}') as criteria
		FROM activities a
		LEFT JOIN activity_criteria ac ON a.id = ac.activity_id
		LEFT JOIN criteria c ON ac.criteria_id = c.id
		%s
		GROUP BY a.id
		ORDER BY a.created_at DESC
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
			&a.Location,
			&a.TargetAudience,
			&a.Rules,
			&a.Rewards,
			&a.ContactInfo,
			&a.UnitID,
			&a.StartDate,
			&a.EndDate,
			&a.IsActive,
			&a.RegistrationURL,
			&a.ReviewLevel,
			&a.Organizer,
			&a.CreatedAt,
			&a.UpdatedAt,
			&a.Criteria,
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
		       location, target_audience, rules, rewards, contact_info,
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
		&a.Location,
		&a.TargetAudience,
		&a.Rules,
		&a.Rewards,
		&a.ContactInfo,
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
		       location, target_audience, rules, rewards, contact_info,
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
		&a.Location,
		&a.TargetAudience,
		&a.Rules,
		&a.Rewards,
		&a.ContactInfo,
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

func (r *ActivityRepository) GetCriteriaDocsByActivityID(ctx context.Context, activityID string) ([]*domain.ActivityCriteria, error) {
	query := `
		SELECT ac.id, ac.activity_id, ac.criteria_id, c.code, c.title, c.description, ac.score, c.max_score, ac.created_at, ac.updated_at
		FROM activity_criteria ac
		JOIN criteria c ON c.id = ac.criteria_id
		WHERE ac.activity_id = $1
		ORDER BY ac.created_at ASC`

	rows, err := r.pool.Query(ctx, query, activityID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var criteria []*domain.ActivityCriteria
	for rows.Next() {
		var c domain.ActivityCriteria
		err := rows.Scan(
			&c.ID,
			&c.ActivityID,
			&c.CriteriaID,
			&c.CriteriaType,
			&c.Title,
			&c.Description,
			&c.Score,
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
		INSERT INTO activities (title, description, slug, thumbnail_url, short_description, location, target_audience, rules, rewards, contact_info, unit_id, start_date, end_date, is_active, registration_url, review_level, organizer)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
		RETURNING id, created_at, updated_at`

	err := r.pool.QueryRow(ctx, query,
		activity.Title,
		activity.Description,
		activity.Slug,
		activity.ThumbnailURL,
		activity.ShortDescription,
		activity.Location,
		activity.TargetAudience,
		activity.Rules,
		activity.Rewards,
		activity.ContactInfo,
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
		    location = $7, target_audience = $8, rules = $9, rewards = $10, contact_info = $11,
		    unit_id = $12, start_date = $13, end_date = $14, is_active = $15, registration_url = $16,
		    review_level = $17, organizer = $18, updated_at = NOW()
		WHERE id = $1
		RETURNING updated_at`

	err := r.pool.QueryRow(ctx, query,
		id,
		activity.Title,
		activity.Description,
		activity.Slug,
		activity.ThumbnailURL,
		activity.ShortDescription,
		activity.Location,
		activity.TargetAudience,
		activity.Rules,
		activity.Rewards,
		activity.ContactInfo,
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
	_, err := r.pool.Exec(ctx, query, id)
	return err
}

func (r *ActivityRepository) SetCriteria(ctx context.Context, activityID string, criteriaCodes []string) error {
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	// Delete existing criteria
	_, err = tx.Exec(ctx, `DELETE FROM activity_criteria WHERE activity_id = $1`, activityID)
	if err != nil {
		return err
	}

	if len(criteriaCodes) == 0 {
		return tx.Commit(ctx)
	}

	// Insert new criteria
	query := `
		INSERT INTO activity_criteria (id, activity_id, criteria_id, score)
		SELECT gen_random_uuid(), $1, id, max_score
		FROM criteria
		WHERE code = ANY($2)`

	_, err = tx.Exec(ctx, query, activityID, criteriaCodes)
	if err != nil {
		return err
	}

	return tx.Commit(ctx)
}
