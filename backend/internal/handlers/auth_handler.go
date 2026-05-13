package handlers

import (
	"github.com/duckviet/bd5t/backend/internal/auth"
	"github.com/duckviet/bd5t/backend/internal/dto"
	svcImpl "github.com/duckviet/bd5t/backend/internal/service/impl"
	"github.com/duckviet/bd5t/backend/pkg/response"
	"github.com/gin-gonic/gin"
)

type AuthAPI struct {
	authService *svcImpl.AuthService
}

func NewAuthAPI(authService *svcImpl.AuthService) *AuthAPI {
	return &AuthAPI{authService: authService}
}

func (h *AuthAPI) Register(c *gin.Context) {
	var req dto.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, err)
		return
	}

	user, err := h.authService.Register(c.Request.Context(), &req)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.Created(c, gin.H{"user": user})
}

func (h *AuthAPI) Login(c *gin.Context) {
	var req dto.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, err)
		return
	}

	result, err := h.authService.Login(c.Request.Context(), &req)
	if err != nil {
		response.Error(c, err)
		return
	}

	setAuthCookies(c, result.AccessToken, result.RefreshToken)

	response.OK(c, gin.H{
		"user":         result.User,
		"accessToken":  result.AccessToken,
		"refreshToken": result.RefreshToken,
	})
}

func (h *AuthAPI) Logout(c *gin.Context) {
	user := auth.MustGetCurrentUser(c)

	err := h.authService.Logout(c.Request.Context(), user.ID)
	if err != nil {
		response.Error(c, err)
		return
	}

	clearAuthCookies(c)
	response.OK(c, gin.H{"message": "logged out successfully"})
}

func (h *AuthAPI) Refresh(c *gin.Context) {
	var req dto.RefreshRequest
	c.ShouldBindJSON(&req)

	refreshToken := req.RefreshToken
	if refreshToken == "" {
		refreshToken, _ = c.Cookie("refresh_token")
	}

	accessToken, err := h.authService.RefreshToken(c.Request.Context(), refreshToken)
	if err != nil {
		response.Error(c, err)
		return
	}

	setAccessCookie(c, accessToken)
	response.OK(c, gin.H{"accessToken": accessToken})
}

func (h *AuthAPI) Me(c *gin.Context) {
	user := auth.MustGetCurrentUser(c)

	userProfile, err := h.authService.Me(c.Request.Context(), user.ID)
	if err != nil {
		response.Error(c, err)
		return
	}

	response.OK(c, userProfile)
}

func setAuthCookies(c *gin.Context, accessToken, refreshToken string) {
	c.SetCookie("access_token", accessToken, 3600*24*7, "/", "", false, true)
	c.SetCookie("refresh_token", refreshToken, 3600*24*30, "/", "", false, true)
}

func setAccessCookie(c *gin.Context, accessToken string) {
	c.SetCookie("access_token", accessToken, 3600*24*7, "/", "", false, true)
}

func clearAuthCookies(c *gin.Context) {
	c.SetCookie("access_token", "", -1, "/", "", false, true)
	c.SetCookie("refresh_token", "", -1, "/", "", false, true)
}

var _ interface{} = (*AuthAPI)(nil)
