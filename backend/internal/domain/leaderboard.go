package domain

type LeaderboardItem struct {
	Rank          int
	UserID        string
	UserName      string
	UnitID        *string
	UnitName      *string
	TotalApproved int
	TotalScore    int
}
