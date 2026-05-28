package interfaces

import "github.com/gin-gonic/gin"

type ActivitiesAPIHandler interface {
	GetActivityDetail(c *gin.Context)
	InviteActivity(c *gin.Context)
	ListActivities(c *gin.Context)
}
