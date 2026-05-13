package middleware

import (
	"github.com/duckviet/bd5t/backend/internal/auth"
	"github.com/gin-gonic/gin"
)

func OptionalAuth(tokenMgr *auth.TokenManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		token := extractToken(c)
		if token == "" {
			c.Next()
			return
		}

		claims, err := tokenMgr.VerifyToken(token)
		if err != nil || claims.Expired() {
			c.Next()
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
