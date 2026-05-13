package interfaces

import "github.com/gin-gonic/gin"

type EvidencesAPIHandler interface {
	CreateEvidence(c *gin.Context)
	DeleteEvidence(c *gin.Context)
	ListEvidences(c *gin.Context)
}
