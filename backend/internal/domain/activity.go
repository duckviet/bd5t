package domain

import (
	"time"
)

type Activity struct {
	ID               string
	Title            string
	Description      *string
	Slug             *string
	ThumbnailURL     *string
	ShortDescription *string
	Location         *string
	TargetAudience    *string
	Rules            *string
	Rewards          *string
	ContactInfo      *string
	UnitID           *string
	StartDate        *time.Time
	EndDate          *time.Time
	IsActive         bool
	RegistrationURL  *string
	ReviewLevel      *string
	Organizer        *string
	Criteria         []string
	CreatedAt        time.Time
	UpdatedAt        time.Time
}

type ReviewLevel string

const (
	ReviewLevelSchool     ReviewLevel = "TRUONG"
	ReviewLevelUniversity ReviewLevel = "DHQGHN"
	ReviewLevelCity       ReviewLevel = "THANH_PHO"
	ReviewLevelCentral    ReviewLevel = "TRUNG_UONG"
)
