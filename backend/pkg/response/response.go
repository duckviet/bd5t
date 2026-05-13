package response

import (
	"errors"

	appErrors "github.com/duckviet/bd5t/backend/internal/errors"
	"github.com/gin-gonic/gin"
)

type PaginationMeta struct {
	Page       int   `json:"page"`
	PageSize   int   `json:"pageSize"`
	Total      int64 `json:"total"`
	TotalPages int   `json:"totalPages"`
}

type PaginatedResponse struct {
	Success bool            `json:"success"`
	Data    interface{}     `json:"data"`
	Meta    *PaginationMeta `json:"meta"`
}

func OK(c *gin.Context, data interface{}) {
	c.JSON(200, gin.H{
		"success": true,
		"data":    data,
	})
}

func Created(c *gin.Context, data interface{}) {
	c.JSON(201, gin.H{
		"success": true,
		"data":    data,
	})
}

func NoContent(c *gin.Context) {
	c.Status(204)
}

func Paginated(c *gin.Context, data interface{}, meta *PaginationMeta) {
	c.JSON(200, PaginatedResponse{
		Success: true,
		Data:    data,
		Meta:    meta,
	})
}

func Error(c *gin.Context, err error) {
	var appErr *appErrors.AppError
	if errors.As(err, &appErr) {
		c.JSON(appErr.HTTPStatus, gin.H{
			"success": false,
			"error": gin.H{
				"code":    appErr.Code,
				"message": appErr.Message,
				"details": appErr.Details,
			},
		})
		return
	}

	c.JSON(500, gin.H{
		"success": false,
		"error": gin.H{
			"code":    appErrors.CodeInternalError,
			"message": "An unexpected error occurred",
		},
	})
}
