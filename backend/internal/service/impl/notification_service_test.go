package impl

import (
	"context"
	"testing"
	"time"

	"github.com/duckviet/bd5t/backend/internal/domain"
	"github.com/duckviet/bd5t/backend/internal/repository/interfaces"
)

type fakeNotificationRepository struct {
	recipients  map[string][]*interfaces.ActivityNotificationRecipient
	deadlineIDs []string
	activeIDs   []string
	createdKeys map[string]bool
	created     []*domain.Notification
}

func newFakeNotificationRepository() *fakeNotificationRepository {
	return &fakeNotificationRepository{
		recipients:  map[string][]*interfaces.ActivityNotificationRecipient{},
		createdKeys: map[string]bool{},
	}
}

func (r *fakeNotificationRepository) ListByUser(context.Context, string) ([]*domain.Notification, error) {
	return nil, nil
}

func (r *fakeNotificationRepository) Create(context.Context, *domain.Notification) error {
	return nil
}

func (r *fakeNotificationRepository) CreateIdempotent(_ context.Context, notification *domain.Notification) (bool, error) {
	key := notification.UserID + "|" + notification.Type + "|" + dataString(notification, "activityId") + "|" + dataString(notification, "batchKey")
	if r.createdKeys[key] {
		return false, nil
	}
	r.createdKeys[key] = true
	r.created = append(r.created, notification)
	return true, nil
}

func (r *fakeNotificationRepository) ListActivityNotificationRecipients(_ context.Context, activityID string, notificationType string) ([]*interfaces.ActivityNotificationRecipient, error) {
	return r.recipients[activityID], nil
}

func (r *fakeNotificationRepository) ListDeadlineSoonActivityIDs(context.Context, int) ([]string, error) {
	return r.deadlineIDs, nil
}

func (r *fakeNotificationRepository) ListActiveActivityIDs(context.Context) ([]string, error) {
	return r.activeIDs, nil
}

func (r *fakeNotificationRepository) MarkRead(context.Context, string, string) (*domain.Notification, error) {
	return nil, nil
}

func (r *fakeNotificationRepository) MarkAllRead(context.Context, string) (int64, error) {
	return 0, nil
}

func dataString(notification *domain.Notification, key string) string {
	value, _ := notification.Data[key].(string)
	return value
}

func TestNotifyActivityNewDedupe(t *testing.T) {
	repo := newFakeNotificationRepository()
	repo.recipients["activity-1"] = []*interfaces.ActivityNotificationRecipient{
		{
			UserID:        "user-1",
			ActivityID:    "activity-1",
			ActivitySlug:  "activity-one",
			ActivityTitle: "Activity One",
			ReviewLevel:   "TRUONG",
			Criteria:      []string{"HOC_TAP"},
		},
	}
	service := NewNotificationService(repo)

	first, err := service.NotifyActivityNew(context.Background(), "activity-1")
	if err != nil {
		t.Fatalf("NotifyActivityNew first call returned error: %v", err)
	}
	if first.Created != 1 || first.Skipped != 0 || first.MatchedUsers != 1 {
		t.Fatalf("first result = %+v, want created=1 skipped=0 matchedUsers=1", first)
	}

	second, err := service.NotifyActivityNew(context.Background(), "activity-1")
	if err != nil {
		t.Fatalf("NotifyActivityNew second call returned error: %v", err)
	}
	if second.Created != 0 || second.Skipped != 1 || second.MatchedUsers != 1 {
		t.Fatalf("second result = %+v, want created=0 skipped=1 matchedUsers=1", second)
	}
}

func TestNotifyDeadlineSoon(t *testing.T) {
	endDate := time.Date(2026, 5, 20, 0, 0, 0, 0, time.UTC)
	repo := newFakeNotificationRepository()
	repo.deadlineIDs = []string{"activity-1"}
	repo.recipients["activity-1"] = []*interfaces.ActivityNotificationRecipient{
		{
			UserID:        "user-1",
			ActivityID:    "activity-1",
			ActivitySlug:  "activity-one",
			ActivityTitle: "Activity One",
			ReviewLevel:   "TRUONG",
			Criteria:      []string{"HOC_TAP"},
			EndDate:       &endDate,
		},
	}
	service := NewNotificationService(repo)

	result, err := service.NotifyDeadlineSoon(context.Background(), 3)
	if err != nil {
		t.Fatalf("NotifyDeadlineSoon returned error: %v", err)
	}
	if result.Created != 1 || result.MatchedUsers != 1 {
		t.Fatalf("result = %+v, want created=1 matchedUsers=1", result)
	}
	if len(repo.created) != 1 {
		t.Fatalf("created notifications = %d, want 1", len(repo.created))
	}
	notification := repo.created[0]
	if notification.Type != domain.NotificationTypeActivityDeadlineSoon {
		t.Fatalf("notification type = %q, want %q", notification.Type, domain.NotificationTypeActivityDeadlineSoon)
	}
	if notification.Data["daysRemaining"] != 3 {
		t.Fatalf("daysRemaining = %v, want 3", notification.Data["daysRemaining"])
	}
}

func TestNotifyDeadlineSoonRejectsUnsupportedDays(t *testing.T) {
	service := NewNotificationService(newFakeNotificationRepository())

	if _, err := service.NotifyDeadlineSoon(context.Background(), 5); err == nil {
		t.Fatal("NotifyDeadlineSoon accepted unsupported days value")
	}
}
