package impl

import (
	"context"

	"github.com/duckviet/bd5t/backend/internal/domain"
	"github.com/duckviet/bd5t/backend/internal/repository/interfaces"
	"github.com/jackc/pgx/v5/pgxpool"
)

type UnitRepository struct {
	pool *pgxpool.Pool
}

func NewUnitRepository(pool *pgxpool.Pool) *UnitRepository {
	return &UnitRepository{pool: pool}
}

var _ interfaces.UnitRepository = (*UnitRepository)(nil)

func (r *UnitRepository) List(ctx context.Context) ([]*domain.Unit, error) {
	query := `
		SELECT id, name, code, description, created_at, updated_at
		FROM units
		ORDER BY name ASC`

	rows, err := r.pool.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var units []*domain.Unit
	for rows.Next() {
		var unit domain.Unit
		err := rows.Scan(
			&unit.ID,
			&unit.Name,
			&unit.Code,
			&unit.Description,
			&unit.CreatedAt,
			&unit.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		units = append(units, &unit)
	}

	return units, nil
}
