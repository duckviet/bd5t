package handlers

import (
	"github.com/duckviet/bd5t/backend/pkg/response"
	"github.com/gin-gonic/gin"
)

type HealthHandler struct{}

func NewHealthHandler() *HealthHandler {
	return &HealthHandler{}
}

func (h *HealthHandler) Healthz(c *gin.Context) {
	response.OK(c, gin.H{"status": "ok"})
}

func (h *HealthHandler) Readyz(c *gin.Context) {
	response.OK(c, gin.H{"status": "ok"})
}

type HealthAPI struct{}

func NewHealthAPI() *HealthAPI {
	return &HealthAPI{}
}

func (h *HealthAPI) Healthz(c *gin.Context) {
	response.OK(c, gin.H{"status": "ok"})
}

func (h *HealthAPI) Readyz(c *gin.Context) {
	response.OK(c, gin.H{"status": "ok"})
}
