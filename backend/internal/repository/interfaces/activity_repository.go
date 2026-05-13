package interfaces

import (
	"context"

	"github.com/duckviet/bd5t/backend/internal/domain"
)

type ListActivitiesFilter struct {
	UnitID   *string
	IsActive *bool
}

type ListActivitiesResult struct {
	Activities []*domain.Activity
	Total      int64
}

type ActivityRepository interface {
	List(ctx context.Context, filter *ListActivitiesFilter, page, pageSize int) (*ListActivitiesResult, error)
	GetBySlug(ctx context.Context, slug string) (*domain.Activity, error)
	GetByID(ctx context.Context, id string) (*domain.Activity, error)
	GetCriteriaDocsByActivityID(ctx context.Context, activityID string) ([]*domain.CriteriaDoc, error)
}
