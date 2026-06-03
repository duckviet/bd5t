package interfaces

import "context"

type LeaderboardAPIService interface {
	GetLeaderboardDetail (ctx context.Context, req interface{}) (interface{}, error)
	ListLeaderboard (ctx context.Context, req interface{}) (interface{}, error)
}
