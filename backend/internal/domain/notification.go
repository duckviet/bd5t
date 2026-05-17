package domain

import "time"

type Notification struct {
	ID        string
	UserID    string
	Title     string
	Message   string
	Type      string
	IsRead    bool
	Data      map[string]interface{}
	CreatedAt time.Time
}

const (
	NotificationTypeEvidenceApproved     = "EVIDENCE_APPROVED"
	NotificationTypeEvidenceRejected     = "EVIDENCE_REJECTED"
	NotificationTypeActivityNew          = "ACTIVITY_NEW"
	NotificationTypeActivityDeadlineSoon = "ACTIVITY_DEADLINE_SOON"
	NotificationTypeSuggestion           = "SUGGESTION"
)
