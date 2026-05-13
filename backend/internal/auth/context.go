package auth

import "github.com/gin-gonic/gin"

const CurrentUserKey = "current_user"

type CurrentUser struct {
	ID        string
	Email     string
	Role      string
	StudentID string
}

func SetCurrentUser(c *gin.Context, user *CurrentUser) {
	c.Set(CurrentUserKey, user)
}

func GetCurrentUser(c *gin.Context) (*CurrentUser, bool) {
	val, exists := c.Get(CurrentUserKey)
	if !exists {
		return nil, false
	}
	user, ok := val.(*CurrentUser)
	return user, ok
}

func MustGetCurrentUser(c *gin.Context) *CurrentUser {
	user, exists := c.Get(CurrentUserKey)
	if !exists {
		panic("current user not found in context")
	}
	return user.(*CurrentUser)
}
