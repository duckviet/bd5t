package timeutil

import "time"

func Now() time.Time {
	return time.Now()
}

func NowUTC() time.Time {
	return time.Now().UTC()
}

func FormatISO(t time.Time) string {
	return t.UTC().Format(time.RFC3339)
}

func ParseISO(s string) (time.Time, error) {
	return time.Parse(time.RFC3339, s)
}
