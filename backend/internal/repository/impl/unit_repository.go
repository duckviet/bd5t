package impl

import (
	"context"
	"errors"

	"github.com/duckviet/bd5t/backend/internal/domain"
	"github.com/duckviet/bd5t/backend/internal/repository/interfaces"
	"github.com/jackc/pgx/v5"
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

func (r *UnitRepository) GetByID(ctx context.Context, id string) (*domain.Unit, error) {
	query := `
		SELECT id, name, code, description, created_at, updated_at
		FROM units WHERE id = $1`

	var unit domain.Unit
	err := r.pool.QueryRow(ctx, query, id).Scan(
		&unit.ID,
		&unit.Name,
		&unit.Code,
		&unit.Description,
		&unit.CreatedAt,
		&unit.UpdatedAt,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &unit, nil
}
