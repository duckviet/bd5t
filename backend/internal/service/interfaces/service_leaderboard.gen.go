package interfaces

import "context"

type LeaderboardAPIService interface {
	ListLeaderboard (ctx context.Context, req interface{}) (interface{}, error)
}
