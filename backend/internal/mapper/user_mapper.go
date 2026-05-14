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
		profile.FullName = *user.DisplayName
	}
	if user.AvatarURL != nil {
		profile.AvatarUrl = *user.AvatarURL
	}
	if user.UnitID != nil {
		profile.UnitId = *user.UnitID
	}
	if user.ClassName != nil {
		profile.ClassName = *user.ClassName
	}
	profile.CreatedAt = user.CreatedAt

	return profile
}

func UserToProfileDTOWithUnit(user *domain.User, unitName string) *dto.UserProfile {
	if user == nil {
		return nil
	}

	profile := UserToProfileDTO(user)
	if unitName != "" {
		profile.UnitName = unitName
	}

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

	if req.UnitId != "" {
		user.UnitID = &req.UnitId
	}

	if req.ClassName != "" {
		user.ClassName = &req.ClassName
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
		profile.FullName = *user.DisplayName
	}
	if user.AvatarURL != nil {
		profile.AvatarUrl = *user.AvatarURL
	}
	if user.UnitID != nil {
		profile.UnitId = *user.UnitID
	}
	if user.ClassName != nil {
		profile.ClassName = *user.ClassName
	}
	profile.CreatedAt = user.CreatedAt

	return profile
}

func TimeToString(t time.Time) string {
	return t.UTC().Format("2006-01-02T15:04:05Z07:00")
}
