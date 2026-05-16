package impl

import (
	"context"

	"github.com/duckviet/bd5t/backend/internal/dto"
	"github.com/duckviet/bd5t/backend/internal/errors"
	"github.com/duckviet/bd5t/backend/internal/mapper"
	"github.com/duckviet/bd5t/backend/internal/repository/interfaces"
)

type NotificationService struct {
	notificationRepo interfaces.NotificationRepository
}

func NewNotificationService(notificationRepo interfaces.NotificationRepository) *NotificationService {
	return &NotificationService{notificationRepo: notificationRepo}
}

func (s *NotificationService) ListNotifications(ctx context.Context, userID string) ([]*dto.NotificationItem, error) {
	notifications, err := s.notificationRepo.ListByUser(ctx, userID)
	if err != nil {
		return nil, errors.ErrInternalError(err, "failed to list notifications")
	}

	items := make([]*dto.NotificationItem, len(notifications))
	for i, notification := range notifications {
		items[i] = mapper.DomainToNotificationItem(notification)
	}

	return items, nil
}

func (s *NotificationService) MarkNotificationRead(ctx context.Context, userID string, notificationID string) (*dto.NotificationItem, error) {
	notification, err := s.notificationRepo.MarkRead(ctx, userID, notificationID)
	if err != nil {
		return nil, errors.ErrInternalError(err, "failed to mark notification as read")
	}
	if notification == nil {
		return nil, errors.ErrNotificationNotFound()
	}

	return mapper.DomainToNotificationItem(notification), nil
}

func (s *NotificationService) MarkAllNotificationsRead(ctx context.Context, userID string) (map[string]int64, error) {
	updated, err := s.notificationRepo.MarkAllRead(ctx, userID)
	if err != nil {
		return nil, errors.ErrInternalError(err, "failed to mark notifications as read")
	}

	return map[string]int64{"updated": updated}, nil
}
