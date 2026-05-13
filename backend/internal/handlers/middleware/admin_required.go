package middleware

import (
	"github.com/duckviet/bd5t/backend/internal/auth"
	"github.com/duckviet/bd5t/backend/internal/errors"
	"github.com/duckviet/bd5t/backend/pkg/response"
	"github.com/gin-gonic/gin"
)

func AdminRequired(tokenMgr *auth.TokenManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		token := extractToken(c)
		if token == "" {
			response.Error(c, errors.ErrUnauthorized())
			c.Abort()
			return
		}

		claims, err := tokenMgr.VerifyToken(token)
		if err != nil {
			response.Error(c, errors.ErrTokenInvalid())
			c.Abort()
			return
		}

		if claims.Expired() {
			response.Error(c, errors.ErrTokenExpired())
			c.Abort()
			return
		}

		if claims.Role != "admin" {
			response.Error(c, errors.ErrForbiddenWithMessage("Admin access required"))
			c.Abort()
			return
		}

		user := &auth.CurrentUser{
			ID:        claims.UserID,
			Email:     claims.Email,
			Role:      claims.Role,
			StudentID: claims.StudentID,
		}

		auth.SetCurrentUser(c, user)
		c.Next()
	}
}
