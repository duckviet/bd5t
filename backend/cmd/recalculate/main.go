package main

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"os"

	repoImpl "github.com/duckviet/bd5t/backend/internal/repository/impl"
	svcImpl "github.com/duckviet/bd5t/backend/internal/service/impl"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type ActCrit struct {
	ID         string
	ActivityID string
	CriteriaID string
	Code       string
}

func awardScoreForLevel(level *string) int {
	if level == nil {
		return 0
	}
	switch *level {
	case "KHUYEN_KHICH":
		return 85
	case "BA":
		return 90
	case "NHI":
		return 95
	case "NHAT":
		return 100
	default:
		return 0
	}
}

func main() {
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "postgres://postgres:postgres@localhost:5436/bd5t?sslmode=disable"
	}

	studentIDFilter := os.Getenv("USER_STUDENT_ID")

	ctx := context.Background()
	config, err := pgxpool.ParseConfig(dbURL)
	if err != nil {
		log.Fatalf("Parse config error: %v", err)
	}

	pool, err := pgxpool.NewWithConfig(ctx, config)
	if err != nil {
		log.Fatalf("Unable to connect to database: %v\n", err)
	}
	defer pool.Close()

	// 1. Fetch all activity criteria mapping
	fmt.Println("Fetching activity criteria mappings...")
	acRows, err := pool.Query(ctx, `
		SELECT ac.id, ac.activity_id, ac.criteria_id, c.code
		FROM activity_criteria ac
		JOIN criteria c ON ac.criteria_id = c.id`)
	if err != nil {
		log.Fatalf("Failed to query activity_criteria: %v", err)
	}
	defer acRows.Close()

	acMap := make(map[string][]ActCrit)
	for acRows.Next() {
		var ac ActCrit
		if err := acRows.Scan(&ac.ID, &ac.ActivityID, &ac.CriteriaID, &ac.Code); err != nil {
			log.Fatalf("Failed to scan activity_criteria row: %v", err)
		}
		acMap[ac.ActivityID] = append(acMap[ac.ActivityID], ac)
	}

	// 2. Fetch evidences to backfill
	fmt.Println("Fetching evidences...")
	query := `
		SELECT e.id, e.user_id, e.activity_id, e.activity_criteria_id, e.score, e.award_level, e.criterion_type, u.student_id, e.status
		FROM evidences e
		JOIN users u ON e.user_id = u.id`
	
	var rows pgx.Rows
	if studentIDFilter != "" {
		fmt.Printf("Filtering evidences for student ID: %s\n", studentIDFilter)
		query += " WHERE u.student_id = $1"
		rows, err = pool.Query(ctx, query, studentIDFilter)
	} else {
		rows, err = pool.Query(ctx, query)
	}
	if err != nil {
		log.Fatalf("Failed to query evidences: %v", err)
	}
	defer rows.Close()

	type EvItem struct {
		ID                 string
		UserID             string
		ActivityID         string
		ActivityCriteriaID *string
		Score              *int
		AwardLevel         *string
		CriterionType      *string
		StudentID          string
		Status             string
	}

	var evidences []EvItem
	for rows.Next() {
		var ev EvItem
		var score sql.NullInt64
		if err := rows.Scan(&ev.ID, &ev.UserID, &ev.ActivityID, &ev.ActivityCriteriaID, &score, &ev.AwardLevel, &ev.CriterionType, &ev.StudentID, &ev.Status); err != nil {
			log.Fatalf("Failed to scan evidence row: %v", err)
		}
		if score.Valid {
			v := int(score.Int64)
			ev.Score = &v
		}
		evidences = append(evidences, ev)
	}

	// 3. Process and backfill evidences
	fmt.Printf("Processing %d evidences...\n", len(evidences))
	updatedCount := 0
	for _, ev := range evidences {
		changed := false

		// Try to resolve activity_criteria_id
		if ev.ActivityCriteriaID == nil {
			critList := acMap[ev.ActivityID]
			if len(critList) == 1 {
				cid := critList[0].ID
				ev.ActivityCriteriaID = &cid
				changed = true
			} else if len(critList) > 1 && ev.CriterionType != nil {
				for _, ac := range critList {
					if ac.Code == *ev.CriterionType {
						cid := ac.ID
						ev.ActivityCriteriaID = &cid
						changed = true
						break
					}
				}
			}
		}

		// Try to resolve criterion_type from activity_criteria_id
		if ev.CriterionType == nil && ev.ActivityCriteriaID != nil {
			critList := acMap[ev.ActivityID]
			for _, ac := range critList {
				if ac.ID == *ev.ActivityCriteriaID {
					code := ac.Code
					ev.CriterionType = &code
					changed = true
					break
				}
			}
		}

		// Try to resolve score for approved evidences
		if ev.Score == nil && ev.Status == "approved" {
			sc := awardScoreForLevel(ev.AwardLevel)
			ev.Score = &sc
			changed = true
		}

		if changed {
			var scoreVal sql.NullInt64
			if ev.Score != nil {
				scoreVal = sql.NullInt64{Int64: int64(*ev.Score), Valid: true}
			}

			_, err := pool.Exec(ctx, `
				UPDATE evidences 
				SET activity_criteria_id = $1, criterion_type = $2, score = $3 
				WHERE id = $4`,
				ev.ActivityCriteriaID, ev.CriterionType, scoreVal, ev.ID)
			if err != nil {
				log.Fatalf("Failed to update evidence %s: %v", ev.ID, err)
			}
			updatedCount++
		}
	}
	fmt.Printf("Updated %d evidences with backfilled values.\n", updatedCount)

	// 4. Instantiate repositories and services to recalculate progress
	fmt.Println("Initializing services for progress recalculation...")
	evidenceRepo := repoImpl.NewEvidenceRepository(pool)
	activityRepo := repoImpl.NewActivityRepository(pool)
	progressRepo := repoImpl.NewProgressRepository(pool)
	progressService := svcImpl.NewProgressService(progressRepo, evidenceRepo, activityRepo)

	// 5. Query students to recalculate progress
	var studentIDs []string
	if studentIDFilter != "" {
		var uid string
		err := pool.QueryRow(ctx, "SELECT id FROM users WHERE student_id = $1 AND role = 'student'", studentIDFilter).Scan(&uid)
		if err != nil {
			log.Fatalf("Failed to find student with ID %s: %v", studentIDFilter, err)
		}
		studentIDs = append(studentIDs, uid)
	} else {
		fmt.Println("Fetching all students to recalculate progress...")
		uRows, err := pool.Query(ctx, "SELECT id FROM users WHERE role = 'student' AND student_id IS NOT NULL")
		if err != nil {
			log.Fatalf("Failed to query students: %v", err)
		}
		defer uRows.Close()
		for uRows.Next() {
			var uid string
			if err := uRows.Scan(&uid); err != nil {
				log.Fatalf("Failed to scan user ID: %v", err)
			}
			studentIDs = append(studentIDs, uid)
		}
	}

	// 6. Run RecalculateProgress
	fmt.Printf("Recalculating progress for %d students...\n", len(studentIDs))
	for i, uid := range studentIDs {
		fmt.Printf("[%d/%d] Recalculating progress for user ID %s...\n", i+1, len(studentIDs), uid)
		if err := progressService.RecalculateProgress(ctx, uid); err != nil {
			log.Fatalf("Failed to recalculate progress for user %s: %v", uid, err)
		}
	}

	fmt.Println("Progress recalculation complete! All database columns backfilled successfully.")
}
