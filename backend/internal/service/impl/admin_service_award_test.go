package impl

import (
	"context"
	"testing"
	"time"

	"github.com/duckviet/bd5t/backend/internal/domain"
	"github.com/duckviet/bd5t/backend/internal/dto"
	"github.com/duckviet/bd5t/backend/internal/repository/interfaces"
)

type fakeEvidenceRepoForAward struct {
	evidenceByID   map[string]*domain.Evidence
	listResult     []*domain.Evidence
	lastStatus     string
	lastReviewNote *string
	lastReviewedBy string
	lastScore      *int
	lastAwardLevel *string
}

func (r *fakeEvidenceRepoForAward) List(context.Context, string, interfaces.EvidenceFilter, int, int) (*interfaces.EvidenceListResult, error) {
	return &interfaces.EvidenceListResult{Evidences: r.listResult}, nil
}

func (r *fakeEvidenceRepoForAward) ListAll(context.Context, interfaces.EvidenceFilter, int, int) (*interfaces.EvidenceListResult, error) {
	return nil, nil
}

func (r *fakeEvidenceRepoForAward) GetStats(context.Context) (*interfaces.EvidenceStats, error) {
	return nil, nil
}

func (r *fakeEvidenceRepoForAward) GetByID(_ context.Context, id string) (*domain.Evidence, error) {
	return r.evidenceByID[id], nil
}

func (r *fakeEvidenceRepoForAward) Create(context.Context, *domain.Evidence) error {
	return nil
}

func (r *fakeEvidenceRepoForAward) Delete(context.Context, string) error {
	return nil
}

func (r *fakeEvidenceRepoForAward) UpdateStatus(_ context.Context, _ string, status string, reviewNote *string, reviewedBy string, score *int, awardLevel *string) error {
	r.lastStatus = status
	r.lastReviewNote = reviewNote
	r.lastReviewedBy = reviewedBy
	r.lastScore = score
	r.lastAwardLevel = awardLevel
	return nil
}

func (r *fakeEvidenceRepoForAward) ListAwardEvidences(context.Context, interfaces.AwardEvidenceFilter, int, int) (*interfaces.EvidenceListResult, error) {
	return &interfaces.EvidenceListResult{Evidences: r.listResult}, nil
}

func (r *fakeEvidenceRepoForAward) ListAwardActivities(context.Context, *string, int, int) ([]*domain.AwardActivityOverview, int, error) {
	return nil, 0, nil
}

func (r *fakeEvidenceRepoForAward) BulkUpdateAwardLevel(context.Context, []string, *string) error {
	return nil
}

type fakeProgressRepoForAward struct {
	upserted *domain.Progress
}

func (r *fakeProgressRepoForAward) GetByUserID(context.Context, string) ([]*domain.Progress, error) {
	return nil, nil
}

func (r *fakeProgressRepoForAward) GetByUserIDAndActivityID(context.Context, string, string) (*domain.Progress, error) {
	return nil, nil
}

func (r *fakeProgressRepoForAward) Upsert(_ context.Context, progress *domain.Progress) error {
	r.upserted = progress
	return nil
}

func (r *fakeProgressRepoForAward) DeleteByUserID(context.Context, string) error {
	return nil
}

type fakeActivityRepoForAward struct{}

func (r *fakeActivityRepoForAward) List(context.Context, *interfaces.ListActivitiesFilter, int, int) (*interfaces.ListActivitiesResult, error) {
	return nil, nil
}

func (r *fakeActivityRepoForAward) GetByID(context.Context, string) (*domain.Activity, error) {
	return nil, nil
}

func (r *fakeActivityRepoForAward) GetBySlug(context.Context, string) (*domain.Activity, error) {
	return nil, nil
}

func (r *fakeActivityRepoForAward) Create(context.Context, *domain.Activity) (*domain.Activity, error) {
	return nil, nil
}

func (r *fakeActivityRepoForAward) Update(context.Context, string, *domain.Activity) (*domain.Activity, error) {
	return nil, nil
}

func (r *fakeActivityRepoForAward) Delete(context.Context, string) error {
	return nil
}

func (r *fakeActivityRepoForAward) SetCriteria(context.Context, string, []string) error {
	return nil
}

func (r *fakeActivityRepoForAward) GetCriteriaDocsByActivityID(context.Context, string) ([]*domain.ActivityCriteria, error) {
	return nil, nil
}

type fakeNotificationRepoForAward struct{}

func (r *fakeNotificationRepoForAward) ListByUser(context.Context, string, int, int) ([]*domain.Notification, int, error) {
	return nil, 0, nil
}

func (r *fakeNotificationRepoForAward) Create(context.Context, *domain.Notification) error {
	return nil
}

func (r *fakeNotificationRepoForAward) CreateIdempotent(context.Context, *domain.Notification) (bool, error) {
	return false, nil
}

func (r *fakeNotificationRepoForAward) ListActivityNotificationRecipients(context.Context, string, string) ([]*interfaces.ActivityNotificationRecipient, error) {
	return nil, nil
}

func (r *fakeNotificationRepoForAward) ListDeadlineSoonActivityIDs(context.Context, int) ([]string, error) {
	return nil, nil
}

func (r *fakeNotificationRepoForAward) ListActiveActivityIDs(context.Context) ([]string, error) {
	return nil, nil
}

func (r *fakeNotificationRepoForAward) MarkRead(context.Context, string, string) (*domain.Notification, error) {
	return nil, nil
}

func (r *fakeNotificationRepoForAward) MarkAllRead(context.Context, string) (int64, error) {
	return 0, nil
}

type fakeEvidenceRepoForAwardList struct {
	listResult []*domain.Evidence
	total      int
}

func (r *fakeEvidenceRepoForAwardList) List(context.Context, string, interfaces.EvidenceFilter, int, int) (*interfaces.EvidenceListResult, error) {
	return &interfaces.EvidenceListResult{Evidences: r.listResult, Total: r.total}, nil
}

func (r *fakeEvidenceRepoForAwardList) ListAll(context.Context, interfaces.EvidenceFilter, int, int) (*interfaces.EvidenceListResult, error) {
	return &interfaces.EvidenceListResult{Evidences: r.listResult, Total: r.total}, nil
}

func (r *fakeEvidenceRepoForAwardList) GetStats(context.Context) (*interfaces.EvidenceStats, error) {
	return nil, nil
}

func (r *fakeEvidenceRepoForAwardList) GetByID(_ context.Context, id string) (*domain.Evidence, error) {
	for _, ev := range r.listResult {
		if ev.ID == id {
			return ev, nil
		}
	}
	return nil, nil
}

func (r *fakeEvidenceRepoForAwardList) Create(context.Context, *domain.Evidence) error {
	return nil
}

func (r *fakeEvidenceRepoForAwardList) Delete(context.Context, string) error {
	return nil
}

func (r *fakeEvidenceRepoForAwardList) UpdateStatus(context.Context, string, string, *string, string, *int, *string) error {
	return nil
}

func (r *fakeEvidenceRepoForAwardList) ListAwardEvidences(_ context.Context, _ interfaces.AwardEvidenceFilter, _ int, _ int) (*interfaces.EvidenceListResult, error) {
	return &interfaces.EvidenceListResult{Evidences: r.listResult, Total: r.total}, nil
}

func (r *fakeEvidenceRepoForAwardList) ListAwardActivities(context.Context, *string, int, int) ([]*domain.AwardActivityOverview, int, error) {
	return nil, 0, nil
}

func (r *fakeEvidenceRepoForAwardList) BulkUpdateAwardLevel(_ context.Context, ids []string, awardLevel *string) error {
	for _, ev := range r.listResult {
		for _, id := range ids {
			if ev.ID == id {
				ev.AwardLevel = awardLevel
			}
		}
	}
	return nil
}

func TestListAwardEvidencesReturnsPaginatedResults(t *testing.T) {
	evidenceRepo := &fakeEvidenceRepoForAwardList{
		listResult: []*domain.Evidence{
			{ID: "e-1", UserID: "u-1", ActivityID: "a-1", Status: domain.StatusApproved, AwardLevel: stringPtr(string(domain.AwardLevelNhat)), ActivityTitle: "Activity 1", Criteria: []string{string(domain.CriterionTypeDaoDuc)}},
			{ID: "e-2", UserID: "u-2", ActivityID: "a-2", Status: domain.StatusApproved, AwardLevel: stringPtr(string(domain.AwardLevelBa)), ActivityTitle: "Activity 2", Criteria: []string{string(domain.CriterionTypeHocTap)}},
		},
		total: 2,
	}
	progressRepo := &fakeProgressRepoForAward{}
	adminSvc := NewAdminService(evidenceRepo, &fakeActivityRepoForAward{}, &fakeNotificationRepoForAward{}, NewProgressService(progressRepo, evidenceRepo, &fakeActivityRepoForAward{}))

	result, err := adminSvc.ListAwardEvidences(context.Background(), AwardEvidenceFilter{}, 1, 20)
	if err != nil {
		t.Fatalf("ListAwardEvidences returned error: %v", err)
	}
	if result == nil {
		t.Fatal("ListAwardEvidences returned nil result")
	}
	if result.Total != 2 {
		t.Fatalf("total = %d, want 2", result.Total)
	}
	if len(result.Evidences) != 2 {
		t.Fatalf("evidences count = %d, want 2", len(result.Evidences))
	}
}

func TestListAwardEvidencesFiltersByAwardLevel(t *testing.T) {
	evidenceRepo := &fakeEvidenceRepoForAwardList{
		listResult: []*domain.Evidence{
			{ID: "e-1", UserID: "u-1", ActivityID: "a-1", Status: domain.StatusApproved, AwardLevel: stringPtr(string(domain.AwardLevelNhat))},
		},
		total: 1,
	}
	progressRepo := &fakeProgressRepoForAward{}
	adminSvc := NewAdminService(evidenceRepo, &fakeActivityRepoForAward{}, &fakeNotificationRepoForAward{}, NewProgressService(progressRepo, evidenceRepo, &fakeActivityRepoForAward{}))

	filter := AwardEvidenceFilter{AwardLevel: stringPtr(string(domain.AwardLevelNhat))}
	result, err := adminSvc.ListAwardEvidences(context.Background(), filter, 1, 20)
	if err != nil {
		t.Fatalf("ListAwardEvidences returned error: %v", err)
	}
	if result == nil {
		t.Fatal("ListAwardEvidences returned nil result")
	}
	if result.Total != 1 {
		t.Fatalf("total = %d, want 1", result.Total)
	}
}

func TestBulkUpdateAwardLevelUpdatesAllGivenEvidences(t *testing.T) {
	evidenceRepo := &fakeEvidenceRepoForAwardList{
		listResult: []*domain.Evidence{
			{ID: "e-1", UserID: "u-1", ActivityID: "a-1", Status: domain.StatusApproved, AwardLevel: stringPtr(string(domain.AwardLevelNone)), Criteria: []string{string(domain.CriterionTypeDaoDuc)}},
			{ID: "e-2", UserID: "u-1", ActivityID: "a-1", Status: domain.StatusApproved, AwardLevel: stringPtr(string(domain.AwardLevelNone)), Criteria: []string{string(domain.CriterionTypeDaoDuc)}},
		},
		total: 2,
	}
	progressRepo := &fakeProgressRepoForAward{}
	adminSvc := NewAdminService(evidenceRepo, &fakeActivityRepoForAward{}, &fakeNotificationRepoForAward{}, NewProgressService(progressRepo, evidenceRepo, &fakeActivityRepoForAward{}))

	result, err := adminSvc.BulkUpdateAwardLevel(context.Background(), []string{"e-1", "e-2"}, string(domain.AwardLevelNhat))
	if err != nil {
		t.Fatalf("BulkUpdateAwardLevel returned error: %v", err)
	}
	if len(result) != 2 {
		t.Fatalf("result count = %d, want 2", len(result))
	}
}

func TestBulkUpdateAwardLevelRejectsEmptyIDs(t *testing.T) {
	progressRepo := &fakeProgressRepoForAward{}
	adminSvc := NewAdminService(&fakeEvidenceRepoForAwardList{}, &fakeActivityRepoForAward{}, &fakeNotificationRepoForAward{}, NewProgressService(progressRepo, &fakeEvidenceRepoForAwardList{}, &fakeActivityRepoForAward{}))

	_, err := adminSvc.BulkUpdateAwardLevel(context.Background(), []string{}, string(domain.AwardLevelNhat))
	if err == nil {
		t.Fatal("BulkUpdateAwardLevel expected error for empty ids, got nil")
	}
}

func TestReviewEvidencePersistsAwardLevelAndScore(t *testing.T) {
	reviewNote := "Chất lượng tốt"
	awardLevel := string(domain.AwardLevelNhat)
	approvedAt := time.Now()
	evidence := &domain.Evidence{
		ID:         "e-1",
		UserID:     "user-1",
		ActivityID: "activity-1",
		Status:     domain.StatusPending,
		Criteria:   []string{string(domain.CriterionTypeDaoDuc)},
	}
	noteRepo := &fakeNotificationRepoForAward{}
	evidenceRepo := &fakeEvidenceRepoForAward{
		evidenceByID: map[string]*domain.Evidence{
			"e-1": evidence,
		},
		listResult: []*domain.Evidence{
			{
				ID:         "e-1",
				UserID:     "user-1",
				ActivityID: "activity-1",
				Status:     domain.StatusApproved,
				Criteria:   []string{string(domain.CriterionTypeDaoDuc)},
				AwardLevel: stringPtr(string(domain.AwardLevelNhat)),
				ReviewedAt: &approvedAt,
			},
		},
	}
	progressRepo := &fakeProgressRepoForAward{}
	progressSvc := NewProgressService(progressRepo, evidenceRepo, &fakeActivityRepoForAward{})
	adminSvc := NewAdminService(evidenceRepo, &fakeActivityRepoForAward{}, noteRepo, progressSvc)

	result, err := adminSvc.ReviewEvidence(context.Background(), "admin-1", "e-1", &dto.ReviewEvidenceRequest{
		Status:     domain.StatusApproved,
		ReviewNote: &reviewNote,
		AwardLevel: &awardLevel,
	})
	if err != nil {
		t.Fatalf("ReviewEvidence returned error: %v", err)
	}
	if result == nil {
		t.Fatal("ReviewEvidence returned nil result")
	}
	if evidenceRepo.lastStatus != domain.StatusApproved {
		t.Fatalf("status = %q, want approved", evidenceRepo.lastStatus)
	}
	if evidenceRepo.lastAwardLevel == nil || *evidenceRepo.lastAwardLevel != awardLevel {
		t.Fatalf("award level = %v, want %q", evidenceRepo.lastAwardLevel, awardLevel)
	}
	if evidenceRepo.lastScore == nil || *evidenceRepo.lastScore != 100 {
		t.Fatalf("score = %v, want 100", evidenceRepo.lastScore)
	}
	if progressRepo.upserted == nil || progressRepo.upserted.UserID != "user-1" || progressRepo.upserted.ActivityID != "activity-1" {
		t.Fatalf("progress upsert = %+v, want user-1/activity-1", progressRepo.upserted)
	}
	if progressRepo.upserted.TotalScore != 150 {
		t.Fatalf("progress totalScore = %d, want 150", progressRepo.upserted.TotalScore)
	}
}

func stringPtr(value string) *string {
	return &value
}

type spyNotificationRepo struct {
	created []*domain.Notification
}

func (r *spyNotificationRepo) ListByUser(context.Context, string, int, int) ([]*domain.Notification, int, error) {
	return nil, 0, nil
}

func (r *spyNotificationRepo) Create(_ context.Context, n *domain.Notification) error {
	r.created = append(r.created, n)
	return nil
}

func (r *spyNotificationRepo) CreateIdempotent(context.Context, *domain.Notification) (bool, error) {
	return false, nil
}

func (r *spyNotificationRepo) ListActivityNotificationRecipients(context.Context, string, string) ([]*interfaces.ActivityNotificationRecipient, error) {
	return nil, nil
}

func (r *spyNotificationRepo) ListDeadlineSoonActivityIDs(context.Context, int) ([]string, error) {
	return nil, nil
}

func (r *spyNotificationRepo) ListActiveActivityIDs(context.Context) ([]string, error) {
	return nil, nil
}

func (r *spyNotificationRepo) MarkRead(context.Context, string, string) (*domain.Notification, error) {
	return nil, nil
}

func (r *spyNotificationRepo) MarkAllRead(context.Context, string) (int64, error) {
	return 0, nil
}

func TestReviewEvidenceSendsAwardNotification(t *testing.T) {
	reviewNote := "Chất lượng tốt"
	awardLevel := string(domain.AwardLevelNhat)
	approvedAt := time.Now()
	evidence := &domain.Evidence{
		ID:            "e-1",
		UserID:        "user-1",
		ActivityID:    "activity-1",
		ActivityTitle: "Hoạt động A",
		Status:        domain.StatusPending,
		Criteria:      []string{string(domain.CriterionTypeDaoDuc)},
	}
	noteRepo := &spyNotificationRepo{}
	evidenceRepo := &fakeEvidenceRepoForAward{
		evidenceByID: map[string]*domain.Evidence{
			"e-1": evidence,
		},
		listResult: []*domain.Evidence{
			{
				ID:            "e-1",
				UserID:        "user-1",
				ActivityID:    "activity-1",
				ActivityTitle: "Hoạt động A",
				Status:        domain.StatusApproved,
				Criteria:      []string{string(domain.CriterionTypeDaoDuc)},
				AwardLevel:    stringPtr(string(domain.AwardLevelNhat)),
				ReviewedAt:    &approvedAt,
			},
		},
	}
	progressRepo := &fakeProgressRepoForAward{}
	progressSvc := NewProgressService(progressRepo, evidenceRepo, &fakeActivityRepoForAward{})
	adminSvc := NewAdminService(evidenceRepo, &fakeActivityRepoForAward{}, noteRepo, progressSvc)

	_, err := adminSvc.ReviewEvidence(context.Background(), "admin-1", "e-1", &dto.ReviewEvidenceRequest{
		Status:     domain.StatusApproved,
		ReviewNote: &reviewNote,
		AwardLevel: &awardLevel,
	})
	if err != nil {
		t.Fatalf("ReviewEvidence returned error: %v", err)
	}

	// We expect 2 notifications: 1 for evidence approved, 1 for award received
	if len(noteRepo.created) != 2 {
		t.Fatalf("expected 2 notifications, got %d", len(noteRepo.created))
	}

	// First notification is evidence review
	reviewNotif := noteRepo.created[0]
	if reviewNotif.Type != domain.NotificationTypeEvidenceApproved {
		t.Errorf("expected review notification type %q, got %q", domain.NotificationTypeEvidenceApproved, reviewNotif.Type)
	}

	// Second notification is the award
	awardNotif := noteRepo.created[1]
	if awardNotif.Type != domain.NotificationTypeAwardReceived {
		t.Errorf("expected award notification type %q, got %q", domain.NotificationTypeAwardReceived, awardNotif.Type)
	}
	if awardNotif.Title != "Bạn đã nhận được giải thưởng!" {
		t.Errorf("expected title 'Bạn đã nhận được giải thưởng!', got %q", awardNotif.Title)
	}
	expectedMsg := "Chúc mừng! Bạn đã nhận được giải Nhất cho hoạt động \"Hoạt động A\"."
	if awardNotif.Message != expectedMsg {
		t.Errorf("expected message %q, got %q", expectedMsg, awardNotif.Message)
	}
}

func TestBulkUpdateAwardLevelSendsAwardNotifications(t *testing.T) {
	evidenceRepo := &fakeEvidenceRepoForAwardList{
		listResult: []*domain.Evidence{
			{ID: "e-1", UserID: "u-1", ActivityID: "a-1", ActivityTitle: "Hoạt động A", Status: domain.StatusApproved, AwardLevel: stringPtr(string(domain.AwardLevelNone)), Criteria: []string{string(domain.CriterionTypeDaoDuc)}},
			{ID: "e-2", UserID: "u-2", ActivityID: "a-1", ActivityTitle: "Hoạt động A", Status: domain.StatusApproved, AwardLevel: stringPtr(string(domain.AwardLevelNone)), Criteria: []string{string(domain.CriterionTypeDaoDuc)}},
		},
		total: 2,
	}
	noteRepo := &spyNotificationRepo{}
	progressRepo := &fakeProgressRepoForAward{}
	adminSvc := NewAdminService(evidenceRepo, &fakeActivityRepoForAward{}, noteRepo, NewProgressService(progressRepo, evidenceRepo, &fakeActivityRepoForAward{}))

	_, err := adminSvc.BulkUpdateAwardLevel(context.Background(), []string{"e-1", "e-2"}, string(domain.AwardLevelNhi))
	if err != nil {
		t.Fatalf("BulkUpdateAwardLevel returned error: %v", err)
	}

	// We expect 2 award notifications
	if len(noteRepo.created) != 2 {
		t.Fatalf("expected 2 notifications, got %d", len(noteRepo.created))
	}

	for i, notif := range noteRepo.created {
		if notif.Type != domain.NotificationTypeAwardReceived {
			t.Errorf("notification %d: expected type %q, got %q", i, domain.NotificationTypeAwardReceived, notif.Type)
		}
		expectedMsg := "Chúc mừng! Bạn đã nhận được giải Nhì cho hoạt động \"Hoạt động A\"."
		if notif.Message != expectedMsg {
			t.Errorf("notification %d: expected message %q, got %q", i, expectedMsg, notif.Message)
		}
	}
}
