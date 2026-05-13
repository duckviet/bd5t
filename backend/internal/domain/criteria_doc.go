package domain

import (
	"time"
)

type CriteriaDoc struct {
	ID          string
	ActivityID  string
	Title       string
	Description *string
	MaxScore    int
	CreatedAt   time.Time
	UpdatedAt   time.Time
}
