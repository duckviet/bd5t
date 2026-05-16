package impl

import (
	"context"

	"github.com/duckviet/bd5t/backend/internal/config"
	"github.com/duckviet/bd5t/backend/internal/dto"
	"github.com/duckviet/bd5t/backend/internal/errors"
	"github.com/duckviet/bd5t/backend/internal/mapper"
	"github.com/duckviet/bd5t/backend/internal/media"
	"github.com/duckviet/bd5t/backend/internal/repository/interfaces"
)

type EvidenceService struct {
	evidenceRepo interfaces.EvidenceRepository
	activityRepo interfaces.ActivityRepository
	fileStorage  *media.FileStorageService
	mediaService *media.MediaService
	cdnBaseURL   string
}

func NewEvidenceService(
	evidenceRepo interfaces.EvidenceRepository,
	activityRepo interfaces.ActivityRepository,
	fileStorage *media.FileStorageService,
	mediaService *media.MediaService,
	cfg config.MediaConfig,
) *EvidenceService {
	return &EvidenceService{
		evidenceRepo: evidenceRepo,
		activityRepo: activityRepo,
		fileStorage:  fileStorage,
		mediaService: mediaService,
		cdnBaseURL:   cfg.CDNBaseURL,
	}
}

type ListEvidencesResult struct {
	Evidences []*dto.EvidenceItem
	Total     int
	Page      int
	PageSize  int
}

func (s *EvidenceService) ListEvidences(ctx context.Context, userID string, activityID *string, status *string, page, pageSize int) (*ListEvidencesResult, error) {
	filter := interfaces.EvidenceFilter{
		ActivityID: activityID,
		Status:     status,
	}

	result, err := s.evidenceRepo.List(ctx, userID, filter, page, pageSize)
	if err != nil {
		return nil, errors.ErrInternalError(err, "failed to list evidences")
	}

	evidences := make([]*dto.EvidenceItem, len(result.Evidences))
	for i, e := range result.Evidences {
		evidences[i] = mapper.DomainToEvidenceItem(e)
	}

	return &ListEvidencesResult{
		Evidences: evidences,
		Total:     result.Total,
		Page:      page,
		PageSize:  pageSize,
	}, nil
}

func (s *EvidenceService) CreateEvidence(ctx context.Context, userID string, req *dto.CreateEvidenceRequest) (*dto.EvidenceItem, error) {
	activity, err := s.activityRepo.GetByID(ctx, req.ActivityId)
	if err != nil {
		return nil, errors.ErrInternalError(err, "failed to get activity")
	}
	if activity == nil {
		return nil, errors.ErrActivityNotFound()
	}

	fileURL := s.cdnBaseURL + "/" + req.FileKey

	evidence := mapper.CreateEvidenceRequestToDomain(req, userID, fileURL)
	evidence.ActivityTitle = activity.Title
	evidence.ReviewLevel = activity.ReviewLevel

	if err := s.evidenceRepo.Create(ctx, evidence); err != nil {
		return nil, errors.ErrInternalError(err, "failed to create evidence")
	}

	created, err := s.evidenceRepo.GetByID(ctx, evidence.ID)
	if err != nil {
		return nil, errors.ErrInternalError(err, "failed to get created evidence")
	}
	if created == nil {
		return nil, errors.ErrEvidenceNotFound()
	}

	return mapper.DomainToEvidenceItem(created), nil
}

func (s *EvidenceService) DeleteEvidence(ctx context.Context, userID, evidenceID string) error {
	evidence, err := s.evidenceRepo.GetByID(ctx, evidenceID)
	if err != nil {
		return errors.ErrInternalError(err, "failed to get evidence")
	}
	if evidence == nil {
		return errors.ErrEvidenceNotFound()
	}

	if evidence.UserID != userID {
		return errors.ErrEvidenceForbidden()
	}

	if evidence.Status == "approved" {
		return errors.ErrEvidenceAlreadyApproved()
	}

	if err := s.evidenceRepo.Delete(ctx, evidenceID); err != nil {
		return errors.ErrInternalError(err, "failed to delete evidence")
	}

	return nil
}
