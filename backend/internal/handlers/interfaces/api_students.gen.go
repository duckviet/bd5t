package interfaces

import "github.com/gin-gonic/gin"

type StudentsAPIHandler interface {
	SearchStudents(c *gin.Context)
}
