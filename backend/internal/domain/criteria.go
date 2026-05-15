package domain

import "time"

type CriteriaType string

const (
	CriteriaTypeDaoDuc     CriteriaType = "DAO_DUC"
	CriteriaTypeHocTap     CriteriaType = "HOC_TAP"
	CriteriaTypeTheLuc     CriteriaType = "THE_LUC"
	CriteriaTypeTinhNguyen CriteriaType = "TINH_NGUYEN"
	CriteriaTypeHoiNhap    CriteriaType = "HOI_NHAP"
)

type Criteria struct {
	ID          string
	Code        CriteriaType
	Title       string
	Description *string
	MaxScore    int
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

type ActivityCriteria struct {
	ID           string
	ActivityID   string
	CriteriaID   string
	CriteriaType CriteriaType
	Title        string
	Description  *string
	Score        int
	MaxScore     int
	CreatedAt    time.Time
	UpdatedAt    time.Time
}
