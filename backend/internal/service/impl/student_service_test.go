package impl

import (
	"context"
	"testing"

	"github.com/duckviet/bd5t/backend/internal/domain"
	"github.com/duckviet/bd5t/backend/internal/repository/interfaces"
)

func TestSearchStudentsPassesCurrentUserAndPagination(t *testing.T) {
	displayName := "Nguyen Van B"
	unitName := "Khoa CNTT"
	userRepo := &fakeUserRepository{
		searchResult: &interfaces.StudentSearchResult{
			Total: 1,
			Students: []*interfaces.StudentSearchItem{
				{
					User: &domain.User{
						ID:          "student-1",
						StudentID:   strPtr("22040001"),
						DisplayName: &displayName,
						Role:        domain.RoleStudent,
					},
					UnitName: &unitName,
				},
			},
		},
	}
	service := NewStudentService(userRepo)

	result, err := service.SearchStudents(context.Background(), "current-user", "  Nguyen  ", 0, 200)
	if err != nil {
		t.Fatalf("SearchStudents returned error: %v", err)
	}
	if userRepo.searchQ != "Nguyen" {
		t.Fatalf("search q = %q, want %q", userRepo.searchQ, "Nguyen")
	}
	if userRepo.searchExclude != "current-user" {
		t.Fatalf("exclude user = %q, want current-user", userRepo.searchExclude)
	}
	if userRepo.searchPage != 1 || userRepo.searchPageSize != 100 {
		t.Fatalf("pagination = page %d pageSize %d, want page 1 pageSize 100", userRepo.searchPage, userRepo.searchPageSize)
	}
	if result.Total != 1 || result.TotalPages != 1 || len(result.Data) != 1 {
		t.Fatalf("result = %+v, want one paginated student", result)
	}
	if result.Data[0].Id == "current-user" {
		t.Fatal("current user was included in search result")
	}
}

func TestSearchStudentsRejectsShortQuery(t *testing.T) {
	service := NewStudentService(&fakeUserRepository{})

	if _, err := service.SearchStudents(context.Background(), "current-user", "a", 1, 20); err == nil {
		t.Fatal("SearchStudents accepted a one-character query")
	}
}
