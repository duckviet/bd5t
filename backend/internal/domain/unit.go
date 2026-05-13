package domain

import (
	"time"
)

type Unit struct {
	ID          string
	Name        string
	Code        string
	Description *string
	CreatedAt   time.Time
	UpdatedAt   time.Time
}
