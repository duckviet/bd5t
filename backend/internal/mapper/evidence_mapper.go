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
		Id:         e.ID,
		ActivityId: e.ActivityID,
		FileUrl:    e.FileURL,
		Status:     e.Status,
		CreatedAt:  e.CreatedAt,
	}

	if e.CriteriaDocID != nil {
		item.CriteriaDocId = e.CriteriaDocID
	}
	if e.Description != nil {
		item.Description = *e.Description
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

	if req.CriteriaDocId != "" {
		evidence.CriteriaDocID = &req.CriteriaDocId
	}
	if req.Description != "" {
		evidence.Description = &req.Description
	}

	return evidence
}
