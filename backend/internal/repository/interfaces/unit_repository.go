package interfaces

import (
	"context"

	"github.com/duckviet/bd5t/backend/internal/domain"
)

type UnitRepository interface {
	List(ctx context.Context) ([]*domain.Unit, error)
}
