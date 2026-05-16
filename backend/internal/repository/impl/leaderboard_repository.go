package impl

import (
	"context"
	"fmt"

	"github.com/duckviet/bd5t/backend/internal/domain"
	"github.com/duckviet/bd5t/backend/internal/repository/interfaces"
	"github.com/jackc/pgx/v5/pgxpool"
)

type LeaderboardRepository struct {
	pool *pgxpool.Pool
}

func NewLeaderboardRepository(pool *pgxpool.Pool) *LeaderboardRepository {
	return &LeaderboardRepository{pool: pool}
}

var _ interfaces.LeaderboardRepository = (*LeaderboardRepository)(nil)

func (r *LeaderboardRepository) List(ctx context.Context, filter interfaces.LeaderboardFilter, page, pageSize int) (*interfaces.LeaderboardResult, error) {
	offset := (page - 1) * pageSize

	baseQuery := `
		SELECT
		       u.id as user_id,
		       COALESCE(u.display_name, u.email) as user_name,
		       u.unit_id,
		       un.name as unit_name,
		       COUNT(DISTINCT e.activity_id) FILTER (WHERE e.status = 'approved') as total_approved,
		       COALESCE(SUM(e.score) FILTER (WHERE e.status = 'approved' AND e.score IS NOT NULL), 0) as total_score
		FROM users u
		LEFT JOIN evidences e ON e.user_id = u.id
		LEFT JOIN units un ON un.id = u.unit_id`

	args := []interface{}{}
	argIndex := 1

	if filter.UnitID != nil {
		baseQuery += fmt.Sprintf(" WHERE u.unit_id = $%d", argIndex)
		args = append(args, *filter.UnitID)
		argIndex++
	}

	baseQuery += fmt.Sprintf(" GROUP BY u.id, u.display_name, u.email, u.unit_id, un.name ORDER BY total_approved DESC, total_score DESC, user_name ASC, user_id ASC LIMIT $%d OFFSET $%d", argIndex, argIndex+1)
	args = append(args, pageSize, offset)

	countQuery := `SELECT COUNT(DISTINCT u.id) FROM users u`
	if filter.UnitID != nil {
		countQuery += fmt.Sprintf(" WHERE u.unit_id = $1")
	}

	var total int
	if filter.UnitID != nil {
		err := r.pool.QueryRow(ctx, countQuery, *filter.UnitID).Scan(&total)
		if err != nil {
			return nil, err
		}
	} else {
		err := r.pool.QueryRow(ctx, countQuery).Scan(&total)
		if err != nil {
			return nil, err
		}
	}

	rows, err := r.pool.Query(ctx, baseQuery, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []*domain.LeaderboardItem
	rank := offset + 1
	for rows.Next() {
		var item domain.LeaderboardItem
		var unitID, unitName *string

		err := rows.Scan(
			&item.UserID,
			&item.UserName,
			&unitID,
			&unitName,
			&item.TotalApproved,
			&item.TotalScore,
		)
		if err != nil {
			return nil, err
		}

		item.Rank = rank
		item.UnitID = unitID
		item.UnitName = unitName

		items = append(items, &item)
		rank++
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	return &interfaces.LeaderboardResult{
		Items: items,
		Total: total,
	}, nil
}
