package impl

import (
	"context"
	"math"
	"strings"

	"github.com/duckviet/bd5t/backend/internal/dto"
	"github.com/duckviet/bd5t/backend/internal/errors"
	"github.com/duckviet/bd5t/backend/internal/repository/interfaces"
)

type StudentService struct {
	userRepo interfaces.UserRepository
}

type SearchStudentsResult struct {
	Data       []*dto.StudentSearchItem
	Page       int
	PageSize   int
	Total      int64
	TotalPages int
}

func NewStudentService(userRepo interfaces.UserRepository) *StudentService {
	return &StudentService{userRepo: userRepo}
}

func (s *StudentService) SearchStudents(ctx context.Context, currentUserID string, q string, page, pageSize int) (*SearchStudentsResult, error) {
	q = strings.TrimSpace(q)
	if len([]rune(q)) < 2 {
		return nil, errors.ErrBadRequest("Search query must be at least 2 characters")
	}
	if len([]rune(q)) > 100 {
		return nil, errors.ErrBadRequest("Search query must be at most 100 characters")
	}
	if page < 1 {
		page = 1
	}
	if pageSize < 1 {
		pageSize = 20
	}
	if pageSize > 100 {
		pageSize = 100
	}

	result, err := s.userRepo.SearchStudents(ctx, q, currentUserID, page, pageSize)
	if err != nil {
		return nil, errors.ErrInternalError(err, "failed to search students")
	}

	items := make([]*dto.StudentSearchItem, 0, len(result.Students))
	for _, student := range result.Students {
		items = append(items, studentSearchItemToDTO(student))
	}

	totalPages := 0
	if result.Total > 0 {
		totalPages = int(math.Ceil(float64(result.Total) / float64(pageSize)))
	}

	return &SearchStudentsResult{
		Data:       items,
		Page:       page,
		PageSize:   pageSize,
		Total:      result.Total,
		TotalPages: totalPages,
	}, nil
}

func studentSearchItemToDTO(item *interfaces.StudentSearchItem) *dto.StudentSearchItem {
	if item == nil || item.User == nil {
		return nil
	}

	student := &dto.StudentSearchItem{
		Id: item.User.ID,
	}
	if item.User.StudentID != nil {
		student.StudentId = *item.User.StudentID
	}
	if item.User.DisplayName != nil {
		student.DisplayName = *item.User.DisplayName
		student.FullName = *item.User.DisplayName
	}
	if item.User.AvatarURL != nil {
		student.AvatarUrl = *item.User.AvatarURL
	}
	if item.User.UnitID != nil {
		student.UnitId = item.User.UnitID
	}
	if item.UnitName != nil {
		student.UnitName = item.UnitName
	}
	if item.User.ClassName != nil {
		student.ClassName = item.User.ClassName
	}

	return student
}
