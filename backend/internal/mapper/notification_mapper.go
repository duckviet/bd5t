package mapper

import (
	"github.com/duckviet/bd5t/backend/internal/domain"
	"github.com/duckviet/bd5t/backend/internal/dto"
)

func DomainToNotificationItem(notification *domain.Notification) *dto.NotificationItem {
	if notification == nil {
		return nil
	}

	return &dto.NotificationItem{
		Id:        notification.ID,
		Title:     notification.Title,
		Message:   notification.Message,
		Type:      notification.Type,
		IsRead:    notification.IsRead,
		Data:      notification.Data,
		CreatedAt: notification.CreatedAt,
	}
}
