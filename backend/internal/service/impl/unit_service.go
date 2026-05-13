package impl

import (
	"context"

	"github.com/duckviet/bd5t/backend/internal/domain"
	"github.com/duckviet/bd5t/backend/internal/dto"
	"github.com/duckviet/bd5t/backend/internal/mapper"
	"github.com/duckviet/bd5t/backend/internal/repository/interfaces"
)

type UnitService struct {
	unitRepo interfaces.UnitRepository
}

func NewUnitService(unitRepo interfaces.UnitRepository) *UnitService {
	return &UnitService{unitRepo: unitRepo}
}

func (s *UnitService) ListUnits(ctx context.Context) ([]*domain.Unit, error) {
	return s.unitRepo.List(ctx)
}

func (s *UnitService) ListUnitsDTO(ctx context.Context) ([]*dto.UnitItem, error) {
	units, err := s.unitRepo.List(ctx)
	if err != nil {
		return nil, err
	}
	return mapper.UnitsToDTO(units), nil
}
