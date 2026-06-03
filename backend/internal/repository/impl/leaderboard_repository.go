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

type LeaderboardRepository struct {
	pool *pgxpool.Pool
}

func NewLeaderboardRepository(pool *pgxpool.Pool) *LeaderboardRepository {
	return &LeaderboardRepository{pool: pool}
}

var _ interfaces.LeaderboardRepository = (*LeaderboardRepository)(nil)

const leaderboardRankingCTE = `
	WITH student_totals AS (
		SELECT
		       u.id as user_id,
		       u.student_id,
		       COALESCE(u.display_name, u.email) as user_name,
		       u.unit_id,
		       un.name as unit_name,
		       u.class_name,
		       COUNT(DISTINCT e.activity_id) FILTER (WHERE e.status = 'approved') as total_approved,
		       COALESCE(SUM(e.score) FILTER (WHERE e.status = 'approved' AND e.score IS NOT NULL), 0) as total_score
		FROM users u
		LEFT JOIN evidences e ON e.user_id = u.id
		LEFT JOIN units un ON un.id = u.unit_id
		WHERE u.role = 'student' AND u.student_id IS NOT NULL
		GROUP BY u.id, u.student_id, u.display_name, u.email, u.unit_id, un.name, u.class_name
	),
	ranked AS (
		SELECT
		       *,
		       ROW_NUMBER() OVER (ORDER BY total_approved DESC, total_score DESC, user_name ASC, user_id ASC) as rank
		FROM student_totals
	)`

func (r *LeaderboardRepository) List(ctx context.Context, filter interfaces.LeaderboardFilter, page, pageSize int) (*interfaces.LeaderboardResult, error) {
	offset := (page - 1) * pageSize

	args := []interface{}{}
	whereParts := []string{}

	if filter.UnitID != nil {
		args = append(args, *filter.UnitID)
		whereParts = append(whereParts, fmt.Sprintf("unit_id = $%d", len(args)))
	}

	if filter.Search != "" {
		args = append(args, "%"+strings.ToLower(filter.Search)+"%")
		whereParts = append(whereParts, fmt.Sprintf("(LOWER(user_name) LIKE $%d OR LOWER(student_id) LIKE $%d OR LOWER(unit_name) LIKE $%d)", len(args), len(args), len(args)))
	}

	whereClause := ""
	if len(whereParts) > 0 {
		whereClause = " WHERE " + strings.Join(whereParts, " AND ")
	}

	var total int
	countQuery := leaderboardRankingCTE + `
		SELECT COUNT(*)
		FROM ranked` + whereClause
	if err := r.pool.QueryRow(ctx, countQuery, args...).Scan(&total); err != nil {
		return nil, err
	}

	queryArgs := append([]interface{}{}, args...)
	queryArgs = append(queryArgs, pageSize, offset)
	query := leaderboardRankingCTE + fmt.Sprintf(`
		SELECT rank, user_id, student_id, user_name, unit_id, unit_name, class_name, total_approved, total_score
		FROM ranked%s
		ORDER BY rank ASC
		LIMIT $%d OFFSET $%d`, whereClause, len(queryArgs)-1, len(queryArgs))

	rows, err := r.pool.Query(ctx, query, queryArgs...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []*domain.LeaderboardItem
	for rows.Next() {
		var item domain.LeaderboardItem
		var unitID, unitName, className *string

		err := rows.Scan(
			&item.Rank,
			&item.UserID,
			&item.StudentID,
			&item.UserName,
			&unitID,
			&unitName,
			&className,
			&item.TotalApproved,
			&item.TotalScore,
		)
		if err != nil {
			return nil, err
		}

		item.UnitID = unitID
		item.UnitName = unitName
		item.ClassName = className

		items = append(items, &item)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	return &interfaces.LeaderboardResult{
		Items: items,
		Total: total,
	}, nil
}

func (r *LeaderboardRepository) GetByStudentID(ctx context.Context, studentID string) (*domain.LeaderboardDetail, error) {
	query := leaderboardRankingCTE + `
		SELECT rank, user_id, student_id, user_name, unit_id, unit_name, class_name, total_approved, total_score
		FROM ranked
		WHERE student_id = $1`

	var item domain.LeaderboardItem
	err := r.pool.QueryRow(ctx, query, studentID).Scan(
		&item.Rank,
		&item.UserID,
		&item.StudentID,
		&item.UserName,
		&item.UnitID,
		&item.UnitName,
		&item.ClassName,
		&item.TotalApproved,
		&item.TotalScore,
	)
	if err == pgx.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	stats, err := r.getCriteriaStats(ctx, item.UserID)
	if err != nil {
		return nil, err
	}

	return &domain.LeaderboardDetail{
		LeaderboardItem: item,
		CriteriaStats:   stats,
	}, nil
}

func (r *LeaderboardRepository) getCriteriaStats(ctx context.Context, userID string) ([]domain.LeaderboardCriteriaStat, error) {
	query := `
		WITH criteria_counts AS (
			SELECT criteria_code, COUNT(DISTINCT activity_id) AS approved_activities
			FROM (
				SELECT e.activity_id, unnest(
					COALESCE(
						CASE
							WHEN e.criterion_type IS NOT NULL THEN ARRAY[e.criterion_type]
							WHEN selected_c.code IS NOT NULL THEN ARRAY[selected_c.code]
							ELSE activity_codes.criteria
						END,
						'{}'
					)
				) AS criteria_code
				FROM evidences e
				LEFT JOIN activity_criteria selected_ac ON e.activity_criteria_id = selected_ac.id
				LEFT JOIN criteria selected_c ON selected_ac.criteria_id = selected_c.id
				LEFT JOIN LATERAL (
					SELECT COALESCE(array_agg(c.code ORDER BY c.code) FILTER (WHERE c.code IS NOT NULL), '{}') as criteria
					FROM activity_criteria ac
					JOIN criteria c ON ac.criteria_id = c.id
					WHERE ac.activity_id = e.activity_id
				) activity_codes ON TRUE
				WHERE e.user_id = $1::uuid AND e.status = 'approved'
			) approved
			WHERE criteria_code IS NOT NULL
			GROUP BY criteria_code
		)
		SELECT c.code, c.title, COALESCE(cc.approved_activities, 0)
		FROM criteria c
		LEFT JOIN criteria_counts cc ON cc.criteria_code = c.code
		ORDER BY CASE c.code
			WHEN 'DAO_DUC' THEN 1
			WHEN 'HOC_TAP' THEN 2
			WHEN 'THE_LUC' THEN 3
			WHEN 'TINH_NGUYEN' THEN 4
			WHEN 'HOI_NHAP' THEN 5
			ELSE 6
		END`

	rows, err := r.pool.Query(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	stats := make([]domain.LeaderboardCriteriaStat, 0)
	for rows.Next() {
		var stat domain.LeaderboardCriteriaStat
		if err := rows.Scan(&stat.Criteria, &stat.Label, &stat.ApprovedActivities); err != nil {
			return nil, err
		}
		stats = append(stats, stat)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	return stats, nil
}
