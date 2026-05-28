package interfaces

import "github.com/gin-gonic/gin"

type LeaderboardAPIHandler interface {
	GetLeaderboardDetail(c *gin.Context)
	ListLeaderboard(c *gin.Context)
}
