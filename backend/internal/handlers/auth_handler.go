package handlers

import (
	"net/http"
	"strings"

	"github.com/duckviet/bd5t/backend/internal/auth"
	"github.com/duckviet/bd5t/backend/internal/config"
	"github.com/duckviet/bd5t/backend/internal/dto"
	svcImpl "github.com/duckviet/bd5t/backend/internal/service/impl"
	"github.com/duckviet/bd5t/backend/pkg/response"
	"github.com/gin-gonic/gin"
)

type AuthAPI struct {
	authService *svcImpl.AuthService
	cookie      config.CookieConfig
}

func NewAuthAPI(authService *svcImpl.AuthService, cookie config.CookieConfig) *AuthAPI {
	return &AuthAPI{authService: authService, cookie: cookie}
}

func (h *AuthAPI) Register(c *gin.Context) {
	var req dto.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, err)
		return
	}

	result, err := h.authService.Register(c.Request.Context(), &req)
	if err != nil {
		response.Error(c, err)
		return
	}

	h.setAuthCookies(c, result.AccessToken, result.RefreshToken)
	response.Created(c, gin.H{
		"user":         result.User,
		"accessToken":  result.AccessToken,
		"refreshToken": result.RefreshToken,
	})
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

	h.setAuthCookies(c, result.AccessToken, result.RefreshToken)

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

	h.clearAuthCookies(c)
	response.OK(c, gin.H{"message": "logged out successfully"})
}

func (h *AuthAPI) Refresh(c *gin.Context) {
	var req dto.RefreshRequest
	_ = c.ShouldBindJSON(&req)

	refreshToken := req.RefreshToken
	if refreshToken == "" {
		refreshToken, _ = c.Cookie("refresh_token")
	}

	accessToken, err := h.authService.RefreshToken(c.Request.Context(), refreshToken)
	if err != nil {
		response.Error(c, err)
		return
	}

	h.setAccessCookie(c, accessToken)
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

func (h *AuthAPI) setAuthCookies(c *gin.Context, accessToken, refreshToken string) {
	h.setCookie(c, "access_token", accessToken, 3600*24*7)
	h.setCookie(c, "refresh_token", refreshToken, 3600*24*30)
}

func (h *AuthAPI) setAccessCookie(c *gin.Context, accessToken string) {
	h.setCookie(c, "access_token", accessToken, 3600*24*7)
}

func (h *AuthAPI) clearAuthCookies(c *gin.Context) {
	h.clearCookie(c, "access_token")
	h.clearCookie(c, "refresh_token")
}

func (h *AuthAPI) setCookie(c *gin.Context, name, value string, maxAge int) {
	http.SetCookie(c.Writer, h.newCookie(name, value, maxAge))
}

func (h *AuthAPI) clearCookie(c *gin.Context, name string) {
	http.SetCookie(c.Writer, h.newCookie(name, "", -1))
}

func (h *AuthAPI) newCookie(name, value string, maxAge int) *http.Cookie {
	return &http.Cookie{
		Name:     name,
		Value:    value,
		Path:     "/",
		Domain:   h.cookie.Domain,
		MaxAge:   maxAge,
		HttpOnly: true,
		Secure:   h.cookie.Secure,
		SameSite: parseSameSite(h.cookie.SameSite),
	}
}

func parseSameSite(value string) http.SameSite {
	switch strings.ToLower(strings.TrimSpace(value)) {
	case "none":
		return http.SameSiteNoneMode
	case "strict":
		return http.SameSiteStrictMode
	case "lax":
		return http.SameSiteLaxMode
	default:
		return http.SameSiteDefaultMode
	}
}

var _ interface{} = (*AuthAPI)(nil)
