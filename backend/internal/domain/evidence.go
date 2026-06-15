package domain

import (
	"time"
)

type Evidence struct {
	ID                 string
	UserID             string
	UserFullName       *string
	UserStudentID      *string
	UserAvatarURL      *string
	UserUnitID         *string
	UserUnitName       *string
	UserClassName      *string
	ActivityID         string
	ActivityTitle      string
	ActivityCriteriaID *string
	Score              *int
	FileURL            string
	FileKey            string
	Description        *string
	Status             string
	ReviewNote         *string
	ReviewedBy         *string
	ReviewedAt         *time.Time
	AwardLevel         *string
	CriterionType      *string
	Criteria           []string
	ReviewLevel        *string
	CreatedAt          time.Time
	UpdatedAt          time.Time
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
