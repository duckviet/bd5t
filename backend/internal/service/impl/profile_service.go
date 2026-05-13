package impl

import (
	"context"

	"github.com/duckviet/bd5t/backend/internal/dto"
	"github.com/duckviet/bd5t/backend/internal/errors"
	"github.com/duckviet/bd5t/backend/internal/mapper"
	"github.com/duckviet/bd5t/backend/internal/repository/interfaces"
)

type ProfileService struct {
	userRepo interfaces.UserRepository
	unitRepo interfaces.UnitRepository
}

func NewProfileService(userRepo interfaces.UserRepository, unitRepo interfaces.UnitRepository) *ProfileService {
	return &ProfileService{
		userRepo: userRepo,
		unitRepo: unitRepo,
	}
}

func (s *ProfileService) GetProfile(ctx context.Context, userID string) (*dto.UserProfile, error) {
	user, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		return nil, errors.ErrInternalError(err, "failed to get user")
	}
	if user == nil {
		return nil, errors.ErrUserNotFound()
	}

	var unitName string
	if user.UnitID != nil {
		unit, err := s.unitRepo.GetByID(ctx, *user.UnitID)
		if err != nil {
			return nil, errors.ErrInternalError(err, "failed to get unit")
		}
		if unit != nil {
			unitName = unit.Name
		}
	}

	return mapper.UserToProfileDTOWithUnit(user, unitName), nil
}

func (s *ProfileService) UpdateProfile(ctx context.Context, userID string, req *dto.UpdateProfileRequest) (*dto.UserProfile, error) {
	user, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		return nil, errors.ErrInternalError(err, "failed to get user")
	}
	if user == nil {
		return nil, errors.ErrUserNotFound()
	}

	if req.FullName != "" {
		user.DisplayName = &req.FullName
	}
	if req.AvatarUrl != "" {
		user.AvatarURL = &req.AvatarUrl
	}
	if req.ClassName != "" {
		user.ClassName = &req.ClassName
	}

	if err := s.userRepo.UpdateProfile(ctx, user); err != nil {
		return nil, errors.ErrInternalError(err, "failed to update profile")
	}

	var unitName string
	if user.UnitID != nil {
		unit, err := s.unitRepo.GetByID(ctx, *user.UnitID)
		if err != nil {
			return nil, errors.ErrInternalError(err, "failed to get unit")
		}
		if unit != nil {
			unitName = unit.Name
		}
	}

	return mapper.UserToProfileDTOWithUnit(user, unitName), nil
}
