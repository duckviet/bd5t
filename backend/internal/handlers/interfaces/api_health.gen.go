package interfaces

import "github.com/gin-gonic/gin"

type HealthAPIHandler interface {
	Healthz(c *gin.Context)
	Readyz(c *gin.Context)
}
