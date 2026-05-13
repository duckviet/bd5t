package interfaces

import "github.com/gin-gonic/gin"

type UnitsAPIHandler interface {
	ListUnits(c *gin.Context)
}
