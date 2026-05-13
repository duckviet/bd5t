package interfaces

import (
	"context"

	"github.com/duckviet/bd5t/backend/internal/domain"
)

type ProgressRepository interface {
	GetByUserID(ctx context.Context, userID string) ([]*domain.Progress, error)
	GetByUserIDAndActivityID(ctx context.Context, userID, activityID string) (*domain.Progress, error)
	Upsert(ctx context.Context, progress *domain.Progress) error
	DeleteByUserID(ctx context.Context, userID string) error
}
