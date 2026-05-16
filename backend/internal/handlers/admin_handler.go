package handlers

import (
	"fmt"

	"github.com/duckviet/bd5t/backend/internal/auth"
	"github.com/duckviet/bd5t/backend/internal/dto"
	repoInterfaces "github.com/duckviet/bd5t/backend/internal/repository/interfaces"
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

func (h *AdminAPI) ListAdminActivities(c *gin.Context) {
	page := 1
	pageSize := 20
	if p := c.Query("page"); p != "" {
		if _, err := fmt.Sscanf(p, "%d", &page); err != nil {
			page = 1
		}
	}
	if ps := c.Query("pageSize"); ps != "" {
		if _, err := fmt.Sscanf(ps, "%d", &pageSize); err != nil {
			pageSize = 20
		}
	}

	var unitID *string
	if value := c.Query("unitId"); value != "" && value != "all" {
		unitID = &value
	}
	var search *string
	if value := c.Query("search"); value != "" {
		search = &value
	}
	var status *string
	if value := c.Query("status"); value != "" && value != "all" {
		status = &value
	}
	var criteria *string
	if value := c.Query("criteria"); value != "" && value != "all" {
		criteria = &value
	}
	var reviewLevel *string
	if value := c.Query("reviewLevel"); value != "" && value != "all" {
		reviewLevel = &value
	}
	var startDateFrom *string
	if value := c.Query("startDateFrom"); value != "" {
		startDateFrom = &value
	}
	var startDateTo *string
	if value := c.Query("startDateTo"); value != "" {
		startDateTo = &value
	}
	var sort *string
	if value := c.Query("sort"); value != "" {
		sort = &value
	}

	result, err := h.adminService.ListAdminActivities(c.Request.Context(), &svcImpl.ListActivitiesParams{
		Page:          page,
		PageSize:      pageSize,
		UnitID:        unitID,
		Search:        search,
		Status:        status,
		Criteria:      criteria,
		ReviewLevel:   reviewLevel,
		StartDateFrom: startDateFrom,
		StartDateTo:   startDateTo,
		Sort:          sort,
	})
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Paginated(c, result.Data, &response.PaginationMeta{
		Page:       int(result.Meta.Page),
		PageSize:   int(result.Meta.PageSize),
		Total:      int64(result.Meta.Total),
		TotalPages: int(result.Meta.TotalPages),
	})
}

func (h *AdminAPI) ListAdminEvidences(c *gin.Context) {
	page := 1
	pageSize := 20
	if p := c.Query("page"); p != "" {
		if _, err := fmt.Sscanf(p, "%d", &page); err != nil {
			page = 1
		}
	}
	if ps := c.Query("pageSize"); ps != "" {
		if _, err := fmt.Sscanf(ps, "%d", &pageSize); err != nil {
			pageSize = 20
		}
	}
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}

	filter := repoInterfaces.EvidenceFilter{}
	if value := c.Query("status"); value != "" && value != "all" {
		filter.Status = &value
	}
	if value := c.Query("search"); value != "" {
		filter.Search = &value
	}
	if value := c.Query("criteria"); value != "" && value != "all" {
		filter.Criteria = &value
	}
	if value := c.Query("submittedFrom"); value != "" {
		filter.SubmittedFrom = &value
	}
	if value := c.Query("submittedTo"); value != "" {
		filter.SubmittedTo = &value
	}
	if value := c.Query("unitId"); value != "" && value != "all" {
		filter.UnitID = &value
	}
	if value := c.Query("className"); value != "" {
		filter.ClassName = &value
	}
	if value := c.Query("sort"); value != "" {
		filter.Sort = &value
	}

	result, err := h.adminService.ListEvidences(c.Request.Context(), filter, page, pageSize)
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

func (h *AdminAPI) GetAdminEvidenceStats(c *gin.Context) {
	result, err := h.adminService.GetEvidenceStats(c.Request.Context())
	if err != nil {
		response.Error(c, err)
		return
	}

	response.OK(c, result)
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

func (h *AdminAPI) BulkReviewEvidence(c *gin.Context) {
	user := auth.MustGetCurrentUser(c)

	var req dto.BulkReviewEvidenceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, err)
		return
	}

	result, err := h.adminService.BulkReviewEvidence(c.Request.Context(), user.ID, &req)
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
