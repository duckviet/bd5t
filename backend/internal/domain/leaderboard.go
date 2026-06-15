package domain

type LeaderboardItem struct {
	Rank              int
	UserID            string
	StudentID         string
	UserName          string
	UnitID            *string
	UnitName          *string
	ClassName         *string
	TotalApproved     int
	TotalScore        int
	HighestAwardLevel *string
}

type LeaderboardCriteriaStat struct {
	Criteria           string
	Label              string
	ApprovedActivities int
}

type LeaderboardDetail struct {
	LeaderboardItem
	CriteriaStats []LeaderboardCriteriaStat
}
