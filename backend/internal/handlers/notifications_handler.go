package handlers

import (
	"github.com/duckviet/bd5t/backend/internal/auth"
	svcImpl "github.com/duckviet/bd5t/backend/internal/service/impl"
	"github.com/duckviet/bd5t/backend/pkg/response"
	"github.com/gin-gonic/gin"
)

type NotificationsAPI struct {
	notificationService *svcImpl.NotificationService
}

func NewNotificationsAPI(notificationService *svcImpl.NotificationService) *NotificationsAPI {
	return &NotificationsAPI{notificationService: notificationService}
}

func (h *NotificationsAPI) ListNotifications(c *gin.Context) {
	user := auth.MustGetCurrentUser(c)

	notifications, err := h.notificationService.ListNotifications(c.Request.Context(), user.ID)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.OK(c, notifications)
}

func (h *NotificationsAPI) MarkNotificationRead(c *gin.Context) {
	user := auth.MustGetCurrentUser(c)
	notificationID := c.Param("id")

	notification, err := h.notificationService.MarkNotificationRead(c.Request.Context(), user.ID, notificationID)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.OK(c, notification)
}

func (h *NotificationsAPI) MarkAllNotificationsRead(c *gin.Context) {
	user := auth.MustGetCurrentUser(c)

	result, err := h.notificationService.MarkAllNotificationsRead(c.Request.Context(), user.ID)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.OK(c, result)
}
