package interfaces

import "github.com/gin-gonic/gin"

type AuthAPIHandler interface {
	Login(c *gin.Context)
	Logout(c *gin.Context)
	Me(c *gin.Context)
	Refresh(c *gin.Context)
	Register(c *gin.Context)
}
