package handlers

import (
	"github.com/duckviet/bd5t/backend/internal/dto"
	svcImpl "github.com/duckviet/bd5t/backend/internal/service/impl"
	"github.com/duckviet/bd5t/backend/pkg/response"
	"github.com/gin-gonic/gin"
)

type UnitsAPI struct {
	unitService *svcImpl.UnitService
}

func NewUnitsAPI(unitService *svcImpl.UnitService) *UnitsAPI {
	return &UnitsAPI{unitService: unitService}
}

func (h *UnitsAPI) ListUnits(c *gin.Context) {
	units, err := h.unitService.ListUnitsDTO(c.Request.Context())
	if err != nil {
		response.Error(c, err)
		return
	}

	data := make([]dto.UnitItem, len(units))
	for i, u := range units {
		if u != nil {
			data[i] = *u
		}
	}

	response.OK(c, data)
}
