package domain

import (
	"time"
)

type User struct {
	ID           string
	Email        string
	PasswordHash string
	StudentID    *string
	DisplayName  *string
	AvatarURL    *string
	UnitID       *string
	ClassName    *string
	Role         string
	CreatedAt    time.Time
	UpdatedAt    time.Time
}

const (
	RoleStudent = "student"
	RoleAdmin   = "admin"
)

func (u *User) IsAdmin() bool {
	return u.Role == RoleAdmin
}

func (u *User) IsStudent() bool {
	return u.Role == RoleStudent
}
