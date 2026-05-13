package middleware

import (
	"github.com/duckviet/bd5t/backend/internal/config"
	"github.com/duckviet/bd5t/backend/internal/limit"
	"github.com/gin-gonic/gin"
)

func RateLimiter(cfg config.RateLimitConfig) gin.HandlerFunc {
	limiter := limit.NewRateLimiter(cfg)
	return func(c *gin.Context) {
		c.Set("rate_limiter", limiter)
		c.Next()
	}
}
