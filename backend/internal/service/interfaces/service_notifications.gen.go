package interfaces

import "context"

type NotificationsAPIService interface {
	ListNotifications (ctx context.Context, req interface{}) (interface{}, error)
	MarkAllNotificationsRead (ctx context.Context, req interface{}) (interface{}, error)
	MarkNotificationRead (ctx context.Context, req interface{}) (interface{}, error)
}
