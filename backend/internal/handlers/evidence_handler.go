package handlers

import (
	"strconv"

	"github.com/duckviet/bd5t/backend/internal/auth"
	"github.com/duckviet/bd5t/backend/internal/dto"
	"github.com/duckviet/bd5t/backend/internal/service/impl"
	"github.com/duckviet/bd5t/backend/pkg/response"
	"github.com/gin-gonic/gin"
)

type EvidencesAPI struct {
	evidenceService *impl.EvidenceService
}

func NewEvidencesAPI(evidenceService *impl.EvidenceService) *EvidencesAPI {
	return &EvidencesAPI{evidenceService: evidenceService}
}

func (h *EvidencesAPI) ListEvidences(c *gin.Context) {
	user := auth.MustGetCurrentUser(c)

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "20"))
	activityID := c.Query("activityId")
	status := c.Query("status")

	var activityIDPtr, statusPtr *string
	if activityID != "" {
		activityIDPtr = &activityID
	}
	if status != "" {
		statusPtr = &status
	}

	result, err := h.evidenceService.ListEvidences(c.Request.Context(), user.ID, activityIDPtr, statusPtr, page, pageSize)
	if err != nil {
		response.Error(c, err)
		return
	}

	totalPages := (result.Total + result.PageSize - 1) / result.PageSize

	response.Paginated(c, result.Evidences, &response.PaginationMeta{
		Page:       result.Page,
		PageSize:   result.PageSize,
		Total:      int64(result.Total),
		TotalPages: totalPages,
	})
}

func (h *EvidencesAPI) CreateEvidence(c *gin.Context) {
	user := auth.MustGetCurrentUser(c)

	var req dto.CreateEvidenceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, err)
		return
	}

	evidence, err := h.evidenceService.CreateEvidence(c.Request.Context(), user.ID, &req)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Created(c, evidence)
}

func (h *EvidencesAPI) DeleteEvidence(c *gin.Context) {
	user := auth.MustGetCurrentUser(c)
	evidenceID := c.Param("id")

	err := h.evidenceService.DeleteEvidence(c.Request.Context(), user.ID, evidenceID)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.OK(c, gin.H{"message": "evidence deleted successfully"})
}
