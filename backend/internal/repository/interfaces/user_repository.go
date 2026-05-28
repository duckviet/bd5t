package interfaces

import (
	"context"

	"github.com/duckviet/bd5t/backend/internal/domain"
)

type StudentSearchItem struct {
	User     *domain.User
	UnitName *string
}

type StudentSearchResult struct {
	Students []*StudentSearchItem
	Total    int64
}

type UserRepository interface {
	GetByID(ctx context.Context, id string) (*domain.User, error)
	GetByEmail(ctx context.Context, email string) (*domain.User, error)
	GetByStudentID(ctx context.Context, studentID string) (*domain.User, error)
	SearchStudents(ctx context.Context, q string, excludeUserID string, page, pageSize int) (*StudentSearchResult, error)
	ListStudentsByIDs(ctx context.Context, userIDs []string, excludeUserID string) ([]*domain.User, error)
	Create(ctx context.Context, user *domain.User) error
	UpdateProfile(ctx context.Context, user *domain.User) error
}
