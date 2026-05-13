package handlers

import (
	"github.com/duckviet/bd5t/backend/internal/auth"
	"github.com/duckviet/bd5t/backend/internal/dto"
	svcImpl "github.com/duckviet/bd5t/backend/internal/service/impl"
	"github.com/duckviet/bd5t/backend/pkg/response"
	"github.com/gin-gonic/gin"
)

type ProfileAPI struct {
	profileService *svcImpl.ProfileService
}

func NewProfileAPI(profileService *svcImpl.ProfileService) *ProfileAPI {
	return &ProfileAPI{profileService: profileService}
}

func (h *ProfileAPI) GetProfile(c *gin.Context) {
	user := auth.MustGetCurrentUser(c)

	profile, err := h.profileService.GetProfile(c.Request.Context(), user.ID)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.OK(c, profile)
}

func (h *ProfileAPI) UpdateProfile(c *gin.Context) {
	user := auth.MustGetCurrentUser(c)

	var req dto.UpdateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, err)
		return
	}

	profile, err := h.profileService.UpdateProfile(c.Request.Context(), user.ID, &req)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.OK(c, profile)
}
