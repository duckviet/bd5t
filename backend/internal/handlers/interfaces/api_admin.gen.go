package interfaces

import "github.com/gin-gonic/gin"

type AdminAPIHandler interface {
	BulkReviewEvidence(c *gin.Context)
	CreateActivity(c *gin.Context)
	DeleteActivity(c *gin.Context)
	GetAdminEvidenceStats(c *gin.Context)
	ListAdminEvidences(c *gin.Context)
	ReviewEvidence(c *gin.Context)
	UpdateActivity(c *gin.Context)
}
