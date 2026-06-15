package interfaces

import "github.com/gin-gonic/gin"

type AdminAPIHandler interface {
	BulkReviewEvidence(c *gin.Context)
	BulkUpdateAwardLevel(c *gin.Context)
	CreateActivity(c *gin.Context)
	DeleteActivity(c *gin.Context)
	GetAdminEvidenceStats(c *gin.Context)
	ListAdminActivities(c *gin.Context)
	ListAdminEvidences(c *gin.Context)
	ListAwardActivities(c *gin.Context)
	NotifyActivitiesBulk(c *gin.Context)
	NotifyActivity(c *gin.Context)
	NotifyDeadlineSoon(c *gin.Context)
	ReviewEvidence(c *gin.Context)
	UpdateActivity(c *gin.Context)
}
