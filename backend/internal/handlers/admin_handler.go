package handlers

import (
	"github.com/duckviet/bd5t/backend/internal/auth"
	"github.com/duckviet/bd5t/backend/internal/dto"
	svcImpl "github.com/duckviet/bd5t/backend/internal/service/impl"
	"github.com/duckviet/bd5t/backend/pkg/response"
	"github.com/gin-gonic/gin"
)

type AdminAPI struct {
	adminService *svcImpl.AdminService
}

func NewAdminAPI(adminService *svcImpl.AdminService) *AdminAPI {
	return &AdminAPI{adminService: adminService}
}

func (h *AdminAPI) ReviewEvidence(c *gin.Context) {
	user := auth.MustGetCurrentUser(c)
	evidenceID := c.Param("id")

	var req dto.ReviewEvidenceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, err)
		return
	}

	result, err := h.adminService.ReviewEvidence(c.Request.Context(), user.ID, evidenceID, &req)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.OK(c, result)
}

func (h *AdminAPI) CreateActivity(c *gin.Context) {
	var req dto.CreateActivityRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, err)
		return
	}

	result, err := h.adminService.CreateActivity(c.Request.Context(), &req)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Created(c, result)
}

func (h *AdminAPI) UpdateActivity(c *gin.Context) {
	id := c.Param("id")

	var req dto.UpdateActivityRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, err)
		return
	}

	result, err := h.adminService.UpdateActivity(c.Request.Context(), id, &req)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.OK(c, result)
}

func (h *AdminAPI) DeleteActivity(c *gin.Context) {
	id := c.Param("id")

	if err := h.adminService.DeleteActivity(c.Request.Context(), id); err != nil {
		response.Error(c, err)
		return
	}

	response.OK(c, gin.H{"message": "Activity deleted successfully"})
}

var _ interface{} = (*AdminAPI)(nil)
