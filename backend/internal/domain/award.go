package domain

import "time"

type AwardStats struct {
	Nhat        int
	Nhi         int
	Ba          int
	KhuyenKhich int
	None        int
}

type AwardStudentEvidence struct {
	EvidenceID  string
	Criteria    string
	AwardLevel  *string
	Score       *int
	FileURL     *string
	Description *string
	CreatedAt   *time.Time
}

type AwardStudentDetail struct {
	UserID        string
	UserFullName  *string
	UserStudentID *string
	ClassName     *string
	Evidences     []AwardStudentEvidence
}

type AwardActivityOverview struct {
	ActivityID    string
	ActivityTitle string
	ReviewLevel   *string
	Criteria      []string
	AwardStats    AwardStats
	TotalStudents int
	Students      []AwardStudentDetail
}
