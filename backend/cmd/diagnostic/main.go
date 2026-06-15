package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/jackc/pgx/v5"
)

func main() {
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "postgres://postgres:postgres@localhost:5436/bd5t?sslmode=disable"
	}

	ctx := context.Background()
	conn, err := pgx.Connect(ctx, dbURL)
	if err != nil {
		log.Fatalf("Unable to connect to database: %v\n", err)
	}
	defer conn.Close(ctx)

	fmt.Println("--- User details for student 22520273 ---")
	var userID, email, role string
	err = conn.QueryRow(ctx, "SELECT id, email, role FROM users WHERE student_id = '22520273'").Scan(&userID, &email, &role)
	if err != nil {
		log.Fatalf("User query error: %v\n", err)
	}
	fmt.Printf("UserID: %s, Email: %s, Role: %s\n\n", userID, email, role)

	fmt.Println("--- Evidences with repository resolution logic ---")
	rowsRes, err := conn.Query(ctx, `
		SELECT e.id, e.activity_id, a.title, e.status,
			   COALESCE(e.criterion_type, selected_c.code, activity_codes.criteria[1]) as criterion_type,
			   COALESCE(
				   CASE
					   WHEN e.criterion_type IS NOT NULL THEN ARRAY[e.criterion_type]
					   WHEN selected_c.code IS NOT NULL THEN ARRAY[selected_c.code]
					   ELSE activity_codes.criteria
				   END,
				   '{}'
			   ) as criteria,
			   e.score, e.award_level
		FROM evidences e
		LEFT JOIN activities a ON e.activity_id = a.id
		LEFT JOIN activity_criteria selected_ac ON e.activity_criteria_id = selected_ac.id
		LEFT JOIN criteria selected_c ON selected_ac.criteria_id = selected_c.id
		LEFT JOIN LATERAL (
			SELECT COALESCE(array_agg(c.code ORDER BY c.code) FILTER (WHERE c.code IS NOT NULL), '{}') as criteria
			FROM activity_criteria ac
			JOIN criteria c ON ac.criteria_id = c.id
			WHERE ac.activity_id = e.activity_id
		) activity_codes ON TRUE
		WHERE e.user_id = $1`, userID)
	if err != nil {
		log.Fatalf("Evidences resolution query error: %v\n", err)
	}
	defer rowsRes.Close()

	for rowsRes.Next() {
		var id, actID, title, status string
		var critType, awardLevel *string
		var score *int
		var criteria []string
		err = rowsRes.Scan(&id, &actID, &title, &status, &critType, &criteria, &score, &awardLevel)
		if err != nil {
			log.Fatalf("Scan resolved error: %v\n", err)
		}
		deref := func(s *string) string {
			if s == nil {
				return "NULL"
			}
			return *s
		}
		derefInt := func(i *int) string {
			if i == nil {
				return "NULL"
			}
			return fmt.Sprintf("%d", *i)
		}
		fmt.Printf("EvidenceID: %s\n  Activity: %s (%s)\n  Status: %s\n  CriterionType: %s\n  CriteriaArray: %v\n  Score: %s\n  AwardLevel: %s\n\n",
			id, title, actID, status, deref(critType), criteria, derefInt(score), deref(awardLevel))
	}

	fmt.Println("--- Criteria mapped to user's activities ---")
	rowsAct, err := conn.Query(ctx, `
		SELECT ac.activity_id, a.title, c.code, c.title
		FROM activity_criteria ac
		JOIN activities a ON ac.activity_id = a.id
		JOIN criteria c ON ac.criteria_id = c.id
		ORDER BY a.title, c.code`)
	if err != nil {
		log.Fatalf("Activity criteria query error: %v\n", err)
	}
	defer rowsAct.Close()

	for rowsAct.Next() {
		var actID, actTitle, critCode, critTitle string
		if err := rowsAct.Scan(&actID, &actTitle, &critCode, &critTitle); err != nil {
			log.Fatalf("Scan activity criteria error: %v\n", err)
		}
		fmt.Printf("Activity: %s (%s) -> Criterion: %s (%s)\n", actTitle, actID, critCode, critTitle)
	}
}

