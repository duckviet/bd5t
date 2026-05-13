package handlers

import (
	"github.com/duckviet/bd5t/backend/internal/auth"
	"github.com/duckviet/bd5t/backend/internal/service/impl"
	"github.com/duckviet/bd5t/backend/pkg/response"
	"github.com/gin-gonic/gin"
)

type ProgressAPI struct {
	progressService *impl.ProgressService
}

func NewProgressAPI(progressService *impl.ProgressService) *ProgressAPI {
	return &ProgressAPI{progressService: progressService}
}

func (h *ProgressAPI) GetProgress(c *gin.Context) {
	user := auth.MustGetCurrentUser(c)

	progress, err := h.progressService.GetProgress(c.Request.Context(), user.ID)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.OK(c, progress)
}
