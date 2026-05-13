package interfaces

import "github.com/gin-gonic/gin"

type LeaderboardAPIHandler interface {
	ListLeaderboard(c *gin.Context)
}
