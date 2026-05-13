package interfaces

import "github.com/gin-gonic/gin"

type ProfileAPIHandler interface {
	GetProfile(c *gin.Context)
	UpdateProfile(c *gin.Context)
}
