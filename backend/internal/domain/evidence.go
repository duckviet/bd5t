package domain

import (
	"time"
)

type Evidence struct {
	ID               string
	UserID           string
	ActivityID       string
	ActivityTitle    string
	CriteriaDocID    *string
	CriteriaDocTitle *string
	FileURL          string
	FileKey          string
	Description      *string
	Status           string
	ReviewNote       *string
	ReviewedBy       *string
	ReviewedAt       *time.Time
	CriterionType    *string
	ReviewLevel      *string
	CreatedAt        time.Time
	UpdatedAt        time.Time
}

const (
	StatusPending  = "pending"
	StatusApproved = "approved"
	StatusRejected = "rejected"
)

const (
	CriterionTypeDaoDuc     = "DAO_DUC"
	CriterionTypeHocTap     = "HOC_TAP"
	CriterionTypeTheLuc     = "THE_LUC"
	CriterionTypeTinhNguyen = "TINH_NGUYEN"
	CriterionTypeHoiNhap    = "HOI_NHAP"
)

func (e *Evidence) IsPending() bool {
	return e.Status == StatusPending
}

func (e *Evidence) IsApproved() bool {
	return e.Status == StatusApproved
}

func (e *Evidence) IsRejected() bool {
	return e.Status == StatusRejected
}
