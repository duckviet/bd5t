package limit

import (
	"net/http"
	"sync"
	"time"

	"github.com/duckviet/bd5t/backend/internal/config"
	"github.com/gin-gonic/gin"
)

type RateLimiter struct {
	mu       sync.Mutex
	requests map[string][]time.Time
	cfg      config.RateLimitConfig
}

func NewRateLimiter(cfg config.RateLimitConfig) *RateLimiter {
	return &RateLimiter{
		requests: make(map[string][]time.Time),
		cfg:      cfg,
	}
}

func (rl *RateLimiter) Login() gin.HandlerFunc {
	return rl.limitByIP(rl.cfg.Login)
}

func (rl *RateLimiter) Upload() gin.HandlerFunc {
	return rl.limitByIP(rl.cfg.Upload)
}

func (rl *RateLimiter) Evidence() gin.HandlerFunc {
	return rl.limitByIP(rl.cfg.Evidence)
}

func (rl *RateLimiter) Profile() gin.HandlerFunc {
	return rl.limitByIP(rl.cfg.Profile)
}

func (rl *RateLimiter) limitByIP(limit int) gin.HandlerFunc {
	return func(c *gin.Context) {
		ip := c.ClientIP()

		rl.mu.Lock()
		defer rl.mu.Unlock()

		now := time.Now()
		window := now.Add(-time.Minute)

		requests := rl.requests[ip]
		var valid []time.Time
		for _, t := range requests {
			if t.After(window) {
				valid = append(valid, t)
			}
		}

		if len(valid) >= limit {
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
				"success": false,
				"error": gin.H{
					"code":    "RATE_LIMIT_EXCEEDED",
					"message": "Too many requests, please try again later",
				},
			})
			return
		}

		rl.requests[ip] = append(valid, now)
		c.Next()
	}
}
