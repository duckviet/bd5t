package interfaces

import "github.com/gin-gonic/gin"

type NotificationsAPIHandler interface {
	ListNotifications(c *gin.Context)
	MarkAllNotificationsRead(c *gin.Context)
	MarkNotificationRead(c *gin.Context)
}
