package interfaces

import "github.com/gin-gonic/gin"

type ProgressAPIHandler interface {
	GetProgress(c *gin.Context)
}
