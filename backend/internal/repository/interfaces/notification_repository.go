package interfaces

import (
	"context"

	"github.com/duckviet/bd5t/backend/internal/domain"
)

type NotificationRepository interface {
	ListByUser(ctx context.Context, userID string) ([]*domain.Notification, error)
	Create(ctx context.Context, notification *domain.Notification) error
	MarkRead(ctx context.Context, userID string, notificationID string) (*domain.Notification, error)
	MarkAllRead(ctx context.Context, userID string) (int64, error)
}
