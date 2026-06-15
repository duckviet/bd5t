package domain

import (
	"time"
)

type Progress struct {
	ID                string
	UserID            string
	ActivityID        string
	TotalScore        int
	CompletedCriteria []CompletedCriteria
	UpdatedAt         time.Time
}

type CompletedCriteria struct {
	CriteriaID         string
	CriteriaType       string
	CriteriaTitle      string
	CriteriaDocID      string
	CriteriaDocTitle   string
	Score              int
	ParticipationScore int
	AwardScore         int
	AwardLevel         string
	EvidenceCount      int
}

type UserActivityProgress struct {
	ActivityID        string
	ActivityTitle     string
	TotalScore        int
	CompletedCriteria []CompletedCriteria
}
