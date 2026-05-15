package mapper

import (
	"github.com/duckviet/bd5t/backend/internal/domain"
	"github.com/duckviet/bd5t/backend/internal/dto"
)

func DomainToEvidenceItem(e *domain.Evidence) *dto.EvidenceItem {
	if e == nil {
		return nil
	}

	item := &dto.EvidenceItem{
		Id:            e.ID,
		ActivityId:    e.ActivityID,
		ActivityTitle: e.ActivityTitle,
		FileUrl:       e.FileURL,
		Status:        e.Status,
		CreatedAt:     e.CreatedAt,
	}

	// legacy criteria_doc fields removed from domain; keep DTO fields nil until OpenAPI regenerated
	if e.Description != nil {
		item.Description = *e.Description
	}
	// criterionType removed from DTO; derive via activityCriteria when needed
	if e.ReviewLevel != nil {
		item.ReviewLevel = e.ReviewLevel
	}
	if e.ReviewNote != nil {
		item.ReviewNote = e.ReviewNote
	}
	if e.ReviewedBy != nil {
		item.ReviewedBy = e.ReviewedBy
	}
	if e.ReviewedAt != nil {
		item.ReviewedAt = e.ReviewedAt
	}
	if e.ActivityCriteriaID != nil {
		item.ActivityCriteriaId = e.ActivityCriteriaID
	}
	if e.Score != nil {
		v := int32(*e.Score)
		item.Score = &v
	}

	return item
}

func CreateEvidenceRequestToDomain(req *dto.CreateEvidenceRequest, userID string, fileURL string) *domain.Evidence {
	evidence := &domain.Evidence{
		UserID:     userID,
		ActivityID: req.ActivityId,
		FileURL:    fileURL,
		FileKey:    req.FileKey,
		Status:     domain.StatusPending,
	}

	// Map incoming activityCriteriaId to domain
	if req.ActivityCriteriaId != nil {
		evidence.ActivityCriteriaID = req.ActivityCriteriaId
	}
	if req.Description != "" {
		evidence.Description = &req.Description
	}

	return evidence
}
