package mapper

import (
	"time"

	"github.com/duckviet/bd5t/backend/internal/domain"
	"github.com/duckviet/bd5t/backend/internal/dto"
)

func UserToProfileDTO(user *domain.User) *dto.UserProfile {
	if user == nil {
		return nil
	}

	profile := &dto.UserProfile{
		Id:    user.ID,
		Email: user.Email,
		Role:  user.Role,
	}

	if user.StudentID != nil {
		profile.StudentId = *user.StudentID
	}
	if user.DisplayName != nil {
		profile.DisplayName = *user.DisplayName
	}
	if user.AvatarURL != nil {
		profile.AvatarUrl = *user.AvatarURL
	}
	profile.CreatedAt = user.CreatedAt

	return profile
}

func RegisterRequestToDomain(req *dto.RegisterRequest) *domain.User {
	user := &domain.User{
		Email: req.Email,
		Role:  domain.RoleStudent,
	}

	if req.StudentId != "" {
		user.StudentID = &req.StudentId
	}

	if req.DisplayName != "" {
		user.DisplayName = &req.DisplayName
	}

	return user
}

func DomainToUserProfile(user *domain.User) *dto.UserProfile {
	if user == nil {
		return nil
	}

	profile := &dto.UserProfile{
		Id:    user.ID,
		Email: user.Email,
		Role:  user.Role,
	}

	if user.StudentID != nil {
		profile.StudentId = *user.StudentID
	}
	if user.DisplayName != nil {
		profile.DisplayName = *user.DisplayName
	}
	if user.AvatarURL != nil {
		profile.AvatarUrl = *user.AvatarURL
	}
	profile.CreatedAt = user.CreatedAt

	return profile
}

func TimeToString(t time.Time) string {
	return t.UTC().Format("2006-01-02T15:04:05Z07:00")
}
