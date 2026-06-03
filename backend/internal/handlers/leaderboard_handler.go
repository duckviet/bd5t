package handlers

import (
	"strconv"

	"github.com/duckviet/bd5t/backend/internal/service/impl"
	"github.com/duckviet/bd5t/backend/pkg/response"
	"github.com/gin-gonic/gin"
)

type LeaderboardAPI struct {
	leaderboardService *impl.LeaderboardService
}

func NewLeaderboardAPI(leaderboardService *impl.LeaderboardService) *LeaderboardAPI {
	return &LeaderboardAPI{leaderboardService: leaderboardService}
}

func (h *LeaderboardAPI) ListLeaderboard(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "20"))
	unitID := c.Query("unitId")
	search := c.Query("search")

	var unitIDPtr *string
	if unitID != "" {
		unitIDPtr = &unitID
	}

	result, err := h.leaderboardService.ListLeaderboard(c.Request.Context(), unitIDPtr, search, page, pageSize)
	if err != nil {
		response.Error(c, err)
		return
	}

	totalPages := (result.Total + result.PageSize - 1) / result.PageSize

	response.Paginated(c, result.Items, &response.PaginationMeta{
		Page:       result.Page,
		PageSize:   result.PageSize,
		Total:      int64(result.Total),
		TotalPages: totalPages,
	})
}

func (h *LeaderboardAPI) GetLeaderboardDetail(c *gin.Context) {
	studentID := c.Param("studentId")

	result, err := h.leaderboardService.GetLeaderboardDetail(c.Request.Context(), studentID)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.OK(c, result)
}
