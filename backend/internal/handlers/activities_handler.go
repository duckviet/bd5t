package handlers

import (
	"strconv"

	appErrors "github.com/duckviet/bd5t/backend/internal/errors"
	svcImpl "github.com/duckviet/bd5t/backend/internal/service/impl"
	"github.com/duckviet/bd5t/backend/pkg/response"
	"github.com/gin-gonic/gin"
)

type ActivitiesAPI struct {
	activityService *svcImpl.ActivityService
}

func NewActivitiesAPI(activityService *svcImpl.ActivityService) *ActivitiesAPI {
	return &ActivitiesAPI{activityService: activityService}
}

func (h *ActivitiesAPI) ListActivities(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "20"))
	unitID := c.Query("unitId")

	var unitIDPtr *string
	if unitID != "" {
		unitIDPtr = &unitID
	}

	result, err := h.activityService.ListActivities(c.Request.Context(), &svcImpl.ListActivitiesParams{
		Page:     page,
		PageSize: pageSize,
		UnitID:   unitIDPtr,
	})
	if err != nil {
		response.Error(c, err)
		return
	}

	meta := &response.PaginationMeta{
		Page:       int(result.Meta.Page),
		PageSize:   int(result.Meta.PageSize),
		Total:      int64(result.Meta.Total),
		TotalPages: int(result.Meta.TotalPages),
	}
	response.Paginated(c, result.Data, meta)
}

func (h *ActivitiesAPI) GetActivityDetail(c *gin.Context) {
	slug := c.Param("slug")
	if slug == "" {
		response.Error(c, appErrors.ErrBadRequest("Slug is required"))
		return
	}

	result, err := h.activityService.GetActivityDetail(c.Request.Context(), slug)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.OK(c, result)
}
