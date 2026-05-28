package impl

import (
	"context"
	"testing"
	"time"

	"github.com/duckviet/bd5t/backend/internal/domain"
	"github.com/duckviet/bd5t/backend/internal/dto"
	"github.com/duckviet/bd5t/backend/internal/repository/interfaces"
)

type fakeActivityRepository struct {
	bySlug map[string]*domain.Activity
}

func (r *fakeActivityRepository) List(context.Context, *interfaces.ListActivitiesFilter, int, int) (*interfaces.ListActivitiesResult, error) {
	return nil, nil
}

func (r *fakeActivityRepository) GetBySlug(_ context.Context, slug string) (*domain.Activity, error) {
	return r.bySlug[slug], nil
}

func (r *fakeActivityRepository) GetByID(context.Context, string) (*domain.Activity, error) {
	return nil, nil
}

func (r *fakeActivityRepository) GetCriteriaDocsByActivityID(context.Context, string) ([]*domain.ActivityCriteria, error) {
	return nil, nil
}

func (r *fakeActivityRepository) Create(context.Context, *domain.Activity) (*domain.Activity, error) {
	return nil, nil
}

func (r *fakeActivityRepository) Update(context.Context, string, *domain.Activity) (*domain.Activity, error) {
	return nil, nil
}

func (r *fakeActivityRepository) Delete(context.Context, string) error {
	return nil
}

func (r *fakeActivityRepository) SetCriteria(context.Context, string, []string) error {
	return nil
}

type fakeUserRepository struct {
	users          map[string]*domain.User
	searchResult   *interfaces.StudentSearchResult
	searchQ        string
	searchExclude  string
	searchPage     int
	searchPageSize int
	listIDs        []string
}

func (r *fakeUserRepository) GetByID(_ context.Context, id string) (*domain.User, error) {
	return r.users[id], nil
}

func (r *fakeUserRepository) GetByEmail(context.Context, string) (*domain.User, error) {
	return nil, nil
}

func (r *fakeUserRepository) GetByStudentID(context.Context, string) (*domain.User, error) {
	return nil, nil
}

func (r *fakeUserRepository) SearchStudents(_ context.Context, q string, excludeUserID string, page, pageSize int) (*interfaces.StudentSearchResult, error) {
	r.searchQ = q
	r.searchExclude = excludeUserID
	r.searchPage = page
	r.searchPageSize = pageSize
	return r.searchResult, nil
}

func (r *fakeUserRepository) ListStudentsByIDs(_ context.Context, userIDs []string, excludeUserID string) ([]*domain.User, error) {
	r.listIDs = append([]string{}, userIDs...)

	users := make([]*domain.User, 0)
	for _, id := range userIDs {
		if id == excludeUserID {
			continue
		}
		user := r.users[id]
		if user != nil && user.Role == domain.RoleStudent {
			users = append(users, user)
		}
	}
	return users, nil
}

func (r *fakeUserRepository) Create(context.Context, *domain.User) error {
	return nil
}

func (r *fakeUserRepository) UpdateProfile(context.Context, *domain.User) error {
	return nil
}

func TestInviteActivityCreatesAndDedupesNotifications(t *testing.T) {
	slug := "activity-one"
	displayName := "Nguyen Van A"
	activitySlug := slug
	userRepo := &fakeUserRepository{
		users: map[string]*domain.User{
			"inviter": {
				ID:          "inviter",
				Email:       "inviter@example.com",
				StudentID:   strPtr("22040000"),
				DisplayName: &displayName,
				Role:        domain.RoleStudent,
			},
			"invitee-1": {ID: "invitee-1", Email: "one@example.com", Role: domain.RoleStudent},
			"invitee-2": {ID: "invitee-2", Email: "two@example.com", Role: domain.RoleStudent},
			"admin":     {ID: "admin", Email: "admin@example.com", Role: domain.RoleAdmin},
		},
	}
	activityRepo := &fakeActivityRepository{
		bySlug: map[string]*domain.Activity{
			slug: {
				ID:        "activity-1",
				Title:     "Activity One",
				Slug:      &activitySlug,
				CreatedAt: time.Now(),
			},
		},
	}
	notificationRepo := newFakeNotificationRepository()
	service := NewActivityInviteService(activityRepo, notificationRepo, userRepo)

	req := &dto.InviteActivityRequest{
		UserIds: []string{"invitee-1", "invitee-1", "invitee-2", "admin", "missing"},
	}
	first, err := service.InviteActivity(context.Background(), slug, "inviter", req)
	if err != nil {
		t.Fatalf("InviteActivity first call returned error: %v", err)
	}
	if first.Created != 2 || first.Skipped != 0 || first.MatchedUsers != 2 {
		t.Fatalf("first result = %+v, want created=2 skipped=0 matchedUsers=2", first)
	}
	if len(userRepo.listIDs) != 4 {
		t.Fatalf("ListStudentsByIDs got %d unique ids, want 4", len(userRepo.listIDs))
	}

	second, err := service.InviteActivity(context.Background(), slug, "inviter", req)
	if err != nil {
		t.Fatalf("InviteActivity second call returned error: %v", err)
	}
	if second.Created != 0 || second.Skipped != 2 || second.MatchedUsers != 2 {
		t.Fatalf("second result = %+v, want created=0 skipped=2 matchedUsers=2", second)
	}
	if len(notificationRepo.created) != 2 {
		t.Fatalf("created notifications = %d, want 2", len(notificationRepo.created))
	}
	if notificationRepo.created[0].Type != domain.NotificationTypeActivityInvite {
		t.Fatalf("notification type = %q, want %q", notificationRepo.created[0].Type, domain.NotificationTypeActivityInvite)
	}
	if notificationRepo.created[0].Data["activitySlug"] != slug {
		t.Fatalf("activitySlug = %v, want %q", notificationRepo.created[0].Data["activitySlug"], slug)
	}
}

func TestInviteActivityRejectsMissingActivity(t *testing.T) {
	service := NewActivityInviteService(
		&fakeActivityRepository{bySlug: map[string]*domain.Activity{}},
		newFakeNotificationRepository(),
		&fakeUserRepository{users: map[string]*domain.User{"inviter": {ID: "inviter", Role: domain.RoleStudent}}},
	)

	_, err := service.InviteActivity(context.Background(), "missing", "inviter", &dto.InviteActivityRequest{UserIds: []string{"invitee"}})
	if err == nil {
		t.Fatal("InviteActivity accepted missing activity")
	}
}

func strPtr(value string) *string {
	return &value
}
