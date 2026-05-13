package auth

import (
	"fmt"
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
	accessTTL, _ := time.ParseDuration(cfg.JWT.AccessTTL)
	refreshTTL, _ := time.ParseDuration(cfg.JWT.RefreshTTL)

	return &TokenManager{
		secret:     cfg.JWT.Secret,
		accessTTL:  accessTTL,
		refreshTTL: refreshTTL,
	}
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
