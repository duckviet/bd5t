package interfaces

import "github.com/gin-gonic/gin"

type AdminAPIHandler interface {
	CreateActivity(c *gin.Context)
	DeleteActivity(c *gin.Context)
	ReviewEvidence(c *gin.Context)
	UpdateActivity(c *gin.Context)
}
