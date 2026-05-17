package interfaces

import (
	"context"
	"time"

	"github.com/duckviet/bd5t/backend/internal/domain"
)

type ActivityNotificationRecipient struct {
	UserID        string
	ActivityID    string
	ActivitySlug  string
	ActivityTitle string
	ReviewLevel   string
	Criteria      []string
	EndDate       *time.Time
}

type NotificationRepository interface {
	ListByUser(ctx context.Context, userID string) ([]*domain.Notification, error)
	Create(ctx context.Context, notification *domain.Notification) error
	CreateIdempotent(ctx context.Context, notification *domain.Notification) (bool, error)
	ListActivityNotificationRecipients(ctx context.Context, activityID string, notificationType string) ([]*ActivityNotificationRecipient, error)
	ListDeadlineSoonActivityIDs(ctx context.Context, days int) ([]string, error)
	ListActiveActivityIDs(ctx context.Context) ([]string, error)
	MarkRead(ctx context.Context, userID string, notificationID string) (*domain.Notification, error)
	MarkAllRead(ctx context.Context, userID string) (int64, error)
}
