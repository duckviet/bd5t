package domain

type AwardLevel string

const (
	AwardLevelNone        AwardLevel = "NONE"
	AwardLevelKhuyenKhich AwardLevel = "KHUYEN_KHICH"
	AwardLevelBa          AwardLevel = "BA"
	AwardLevelNhi         AwardLevel = "NHI"
	AwardLevelNhat        AwardLevel = "NHAT"
)

type CriteriaScore struct {
	Criteria              string
	Label                 string
	Score                 int
	MaxScore              int
	ParticipationScore    int
	AwardScore            int
	ApprovedActivityCount int
	AwardLevel            AwardLevel
}
