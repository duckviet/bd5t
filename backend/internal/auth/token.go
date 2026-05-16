package auth

import (
	"fmt"
	"log"
	"time"

	"github.com/duckviet/bd5t/backend/internal/config"
	"github.com/golang-jwt/jwt/v5"
)

type TokenManager struct {
	secret     string
	accessTTL  time.Duration
	refreshTTL time.Duration
}

func NewTokenManager(cfg *config.Config) *TokenManager {
	accessTTL := parseDurationOrDefault("JWT_ACCESS_TTL", cfg.JWT.AccessTTL, time.Hour)
	refreshTTL := parseDurationOrDefault("JWT_REFRESH_TTL", cfg.JWT.RefreshTTL, 7*24*time.Hour)

	return &TokenManager{
		secret:     cfg.JWT.Secret,
		accessTTL:  accessTTL,
		refreshTTL: refreshTTL,
	}
}

func parseDurationOrDefault(name, value string, fallback time.Duration) time.Duration {
	duration, err := time.ParseDuration(value)
	if err == nil && duration > 0 {
		return duration
	}

	log.Printf("Invalid %s=%q, using fallback %s", name, value, fallback)
	return fallback
}

func (tm *TokenManager) SignAccessToken(userID, email, role, studentID string) (string, error) {
	exp := time.Now().Add(tm.accessTTL)
	claims := NewAccessClaims(userID, email, role, studentID, exp)

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(tm.secret))
}

func (tm *TokenManager) SignRefreshToken(userID string) (string, error) {
	exp := time.Now().Add(tm.refreshTTL)
	claims := NewRefreshClaims(userID, exp)

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(tm.secret))
}

func (tm *TokenManager) VerifyToken(tokenStr string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenStr, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(tm.secret), nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		return claims, nil
	}

	return nil, fmt.Errorf("invalid token")
}

func (tm *TokenManager) GetAccessTTL() time.Duration {
	return tm.accessTTL
}

func (tm *TokenManager) GetRefreshTTL() time.Duration {
	return tm.refreshTTL
}
