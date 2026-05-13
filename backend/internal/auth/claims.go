package auth

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type Claims struct {
	UserID    string `json:"user_id"`
	Email     string `json:"email"`
	Role      string `json:"role"`
	StudentID string `json:"student_id"`
	Exp       int64  `json:"exp"`
	Iss       string `json:"iss"`
	Type      string `json:"type"`
}

const (
	TokenTypeAccess  = "access"
	TokenTypeRefresh = "refresh"
)

func NewAccessClaims(userID, email, role, studentID string, exp time.Time) *Claims {
	return &Claims{
		UserID:    userID,
		Email:     email,
		Role:      role,
		StudentID: studentID,
		Exp:       exp.Unix(),
		Iss:       "bd5t",
		Type:      TokenTypeAccess,
	}
}

func NewRefreshClaims(userID string, exp time.Time) *Claims {
	return &Claims{
		UserID: userID,
		Exp:    exp.Unix(),
		Iss:    "bd5t",
		Type:   TokenTypeRefresh,
	}
}

func (c *Claims) IsAccessToken() bool {
	return c.Type == TokenTypeAccess
}

func (c *Claims) IsRefreshToken() bool {
	return c.Type == TokenTypeRefresh
}

func (c *Claims) Expired() bool {
	return time.Now().Unix() > c.Exp
}

func (c *Claims) GetExpirationTime() (*jwt.NumericDate, error) {
	return jwt.NewNumericDate(time.Unix(c.Exp, 0)), nil
}

func (c *Claims) GetIssuedAt() (*jwt.NumericDate, error) {
	return nil, nil
}

func (c *Claims) GetNotBefore() (*jwt.NumericDate, error) {
	return nil, nil
}

func (c *Claims) GetIssuer() (string, error) {
	return c.Iss, nil
}

func (c *Claims) GetSubject() (string, error) {
	return c.UserID, nil
}

func (c *Claims) GetAudience() (jwt.ClaimStrings, error) {
	return nil, nil
}
