package impl

import (
	"context"

	"github.com/duckviet/bd5t/backend/internal/auth"
	"github.com/duckviet/bd5t/backend/internal/dto"
	"github.com/duckviet/bd5t/backend/internal/errors"
	"github.com/duckviet/bd5t/backend/internal/mapper"
	"github.com/duckviet/bd5t/backend/internal/repository/interfaces"
)

type AuthService struct {
	userRepo interfaces.UserRepository
	unitRepo interfaces.UnitRepository
	tokenMgr *auth.TokenManager
}

func NewAuthService(userRepo interfaces.UserRepository, unitRepo interfaces.UnitRepository, tokenMgr *auth.TokenManager) *AuthService {
	return &AuthService{
		userRepo: userRepo,
		unitRepo: unitRepo,
		tokenMgr: tokenMgr,
	}
}

type LoginResult struct {
	User         *dto.UserProfile
	AccessToken  string
	RefreshToken string
}

func (s *AuthService) Register(ctx context.Context, req *dto.RegisterRequest) (*LoginResult, error) {
	existingUser, err := s.userRepo.GetByEmail(ctx, req.Email)
	if err != nil {
		return nil, errors.ErrInternalError(err, "failed to check existing user")
	}
	if existingUser != nil {
		return nil, errors.ErrUserExists()
	}

	if req.StudentId != "" {
		existingStudent, err := s.userRepo.GetByStudentID(ctx, req.StudentId)
		if err != nil {
			return nil, errors.ErrInternalError(err, "failed to check student ID")
		}
		if existingStudent != nil {
			return nil, errors.ErrBadRequest("Student ID already registered")
		}
	}

	hashedPassword, err := auth.HashPassword(req.Password)
	if err != nil {
		return nil, errors.ErrInternalError(err, "failed to hash password")
	}

	user := mapper.RegisterRequestToDomain(req)
	user.PasswordHash = hashedPassword

	if err := s.userRepo.Create(ctx, user); err != nil {
		return nil, errors.ErrInternalError(err, "failed to create user")
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

	accessToken, err := s.tokenMgr.SignAccessToken(user.ID, user.Email, user.Role, "")
	if err != nil {
		return nil, errors.ErrInternalError(err, "failed to sign access token")
	}

	refreshToken, err := s.tokenMgr.SignRefreshToken(user.ID)
	if err != nil {
		return nil, errors.ErrInternalError(err, "failed to sign refresh token")
	}

	return &LoginResult{
		User:         mapper.UserToProfileDTOWithUnit(user, unitName),
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
	}, nil
}

func (s *AuthService) Login(ctx context.Context, req *dto.LoginRequest) (*LoginResult, error) {
	user, err := s.userRepo.GetByEmail(ctx, req.Email)
	if err != nil {
		return nil, errors.ErrInternalError(err, "failed to find user")
	}
	if user == nil {
		return nil, errors.ErrInvalidCredentials()
	}

	if !auth.CheckPassword(req.Password, user.PasswordHash) {
		return nil, errors.ErrInvalidCredentials()
	}

	accessToken, err := s.tokenMgr.SignAccessToken(user.ID, user.Email, user.Role, "")
	if err != nil {
		return nil, errors.ErrInternalError(err, "failed to sign access token")
	}

	refreshToken, err := s.tokenMgr.SignRefreshToken(user.ID)
	if err != nil {
		return nil, errors.ErrInternalError(err, "failed to sign refresh token")
	}

	return &LoginResult{
		User:         mapper.UserToProfileDTO(user),
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
	}, nil
}

func (s *AuthService) Logout(ctx context.Context, userID string) error {
	return nil
}

func (s *AuthService) RefreshToken(ctx context.Context, refreshToken string) (string, error) {
	claims, err := s.tokenMgr.VerifyToken(refreshToken)
	if err != nil {
		return "", errors.ErrTokenInvalid()
	}

	if !claims.IsRefreshToken() {
		return "", errors.ErrTokenInvalid()
	}

	user, err := s.userRepo.GetByID(ctx, claims.UserID)
	if err != nil {
		return "", errors.ErrInternalError(err, "failed to get user")
	}
	if user == nil {
		return "", errors.ErrUnauthorized()
	}

	accessToken, err := s.tokenMgr.SignAccessToken(user.ID, user.Email, user.Role, "")
	if err != nil {
		return "", errors.ErrInternalError(err, "failed to sign access token")
	}

	return accessToken, nil
}

func (s *AuthService) Me(ctx context.Context, userID string) (*dto.UserProfile, error) {
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
