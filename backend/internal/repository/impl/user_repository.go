package impl

import (
	"context"
	"errors"
	"math"

	"github.com/duckviet/bd5t/backend/internal/domain"
	"github.com/duckviet/bd5t/backend/internal/repository/interfaces"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type UserRepository struct {
	pool *pgxpool.Pool
}

func NewUserRepository(pool *pgxpool.Pool) *UserRepository {
	return &UserRepository{pool: pool}
}

var _ interfaces.UserRepository = (*UserRepository)(nil)

func (r *UserRepository) GetByID(ctx context.Context, id string) (*domain.User, error) {
	query := `
		SELECT id, email, password_hash, student_id, display_name, avatar_url, unit_id, class_name, role, created_at, updated_at
		FROM users WHERE id = $1`

	var user domain.User
	var studentID, displayName, avatarURL, unitID, className *string

	err := r.pool.QueryRow(ctx, query, id).Scan(
		&user.ID,
		&user.Email,
		&user.PasswordHash,
		&studentID,
		&displayName,
		&avatarURL,
		&unitID,
		&className,
		&user.Role,
		&user.CreatedAt,
		&user.UpdatedAt,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	user.StudentID = studentID
	user.DisplayName = displayName
	user.AvatarURL = avatarURL
	user.UnitID = unitID
	user.ClassName = className
	return &user, nil
}

func (r *UserRepository) GetByEmail(ctx context.Context, email string) (*domain.User, error) {
	query := `
		SELECT id, email, password_hash, student_id, display_name, avatar_url, unit_id, class_name, role, created_at, updated_at
		FROM users WHERE email = $1`

	var user domain.User
	var studentID, displayName, avatarURL, unitID, className *string

	err := r.pool.QueryRow(ctx, query, email).Scan(
		&user.ID,
		&user.Email,
		&user.PasswordHash,
		&studentID,
		&displayName,
		&avatarURL,
		&unitID,
		&className,
		&user.Role,
		&user.CreatedAt,
		&user.UpdatedAt,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	user.StudentID = studentID
	user.DisplayName = displayName
	user.AvatarURL = avatarURL
	user.UnitID = unitID
	user.ClassName = className
	return &user, nil
}

func (r *UserRepository) GetByStudentID(ctx context.Context, studentID string) (*domain.User, error) {
	query := `
		SELECT id, email, password_hash, student_id, display_name, avatar_url, unit_id, class_name, role, created_at, updated_at
		FROM users WHERE student_id = $1`

	var user domain.User
	var studentIDPtr, displayName, avatarURL, unitID, className *string

	err := r.pool.QueryRow(ctx, query, studentID).Scan(
		&user.ID,
		&user.Email,
		&user.PasswordHash,
		&studentIDPtr,
		&displayName,
		&avatarURL,
		&unitID,
		&className,
		&user.Role,
		&user.CreatedAt,
		&user.UpdatedAt,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	user.StudentID = studentIDPtr
	user.DisplayName = displayName
	user.AvatarURL = avatarURL
	user.UnitID = unitID
	user.ClassName = className
	return &user, nil
}

func (r *UserRepository) SearchStudents(ctx context.Context, q string, excludeUserID string, page, pageSize int) (*interfaces.StudentSearchResult, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 {
		pageSize = 20
	}
	pageSize = int(math.Min(float64(pageSize), 100))

	search := "%" + q + "%"
	offset := (page - 1) * pageSize

	countQuery := `
		SELECT COUNT(*)
		FROM users u
		WHERE u.role = 'student'
		  AND u.id::text <> $1
		  AND (
		    COALESCE(u.student_id, '') ILIKE $2
		    OR COALESCE(u.display_name, '') ILIKE $2
		  )`

	var total int64
	if err := r.pool.QueryRow(ctx, countQuery, excludeUserID, search).Scan(&total); err != nil {
		return nil, err
	}

	query := `
		SELECT u.id, u.email, u.password_hash, u.student_id, u.display_name,
		       u.avatar_url, u.unit_id, units.name, u.class_name, u.role,
		       u.created_at, u.updated_at
		FROM users u
		LEFT JOIN units ON units.id = u.unit_id
		WHERE u.role = 'student'
		  AND u.id::text <> $1
		  AND (
		    COALESCE(u.student_id, '') ILIKE $2
		    OR COALESCE(u.display_name, '') ILIKE $2
		  )
		ORDER BY u.display_name NULLS LAST, u.student_id NULLS LAST, u.created_at DESC
		LIMIT $3 OFFSET $4`

	rows, err := r.pool.Query(ctx, query, excludeUserID, search, pageSize, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	students := make([]*interfaces.StudentSearchItem, 0)
	for rows.Next() {
		var user domain.User
		var studentID, displayName, avatarURL, unitID, unitName, className *string

		if err := rows.Scan(
			&user.ID,
			&user.Email,
			&user.PasswordHash,
			&studentID,
			&displayName,
			&avatarURL,
			&unitID,
			&unitName,
			&className,
			&user.Role,
			&user.CreatedAt,
			&user.UpdatedAt,
		); err != nil {
			return nil, err
		}

		user.StudentID = studentID
		user.DisplayName = displayName
		user.AvatarURL = avatarURL
		user.UnitID = unitID
		user.ClassName = className
		students = append(students, &interfaces.StudentSearchItem{
			User:     &user,
			UnitName: unitName,
		})
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	return &interfaces.StudentSearchResult{Students: students, Total: total}, nil
}

func (r *UserRepository) ListStudentsByIDs(ctx context.Context, userIDs []string, excludeUserID string) ([]*domain.User, error) {
	if len(userIDs) == 0 {
		return []*domain.User{}, nil
	}

	query := `
		SELECT id, email, password_hash, student_id, display_name, avatar_url, unit_id, class_name, role, created_at, updated_at
		FROM users
		WHERE role = 'student'
		  AND id::text <> $1
		  AND id::text = ANY($2::text[])`

	rows, err := r.pool.Query(ctx, query, excludeUserID, userIDs)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	users := make([]*domain.User, 0)
	for rows.Next() {
		var user domain.User
		var studentID, displayName, avatarURL, unitID, className *string

		if err := rows.Scan(
			&user.ID,
			&user.Email,
			&user.PasswordHash,
			&studentID,
			&displayName,
			&avatarURL,
			&unitID,
			&className,
			&user.Role,
			&user.CreatedAt,
			&user.UpdatedAt,
		); err != nil {
			return nil, err
		}

		user.StudentID = studentID
		user.DisplayName = displayName
		user.AvatarURL = avatarURL
		user.UnitID = unitID
		user.ClassName = className
		users = append(users, &user)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	return users, nil
}

func (r *UserRepository) Create(ctx context.Context, user *domain.User) error {
	query := `
		INSERT INTO users (email, password_hash, student_id, display_name, unit_id, class_name, role)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, created_at, updated_at`

	var studentID *string
	if user.StudentID != nil {
		studentID = user.StudentID
	}

	var displayName *string
	if user.DisplayName != nil {
		displayName = user.DisplayName
	}

	var unitID *string
	if user.UnitID != nil {
		unitID = user.UnitID
	}

	var className *string
	if user.ClassName != nil {
		className = user.ClassName
	}

	role := domain.RoleStudent
	if user.Role != "" {
		role = user.Role
	}

	err := r.pool.QueryRow(ctx, query, user.Email, user.PasswordHash, studentID, displayName, unitID, className, role).Scan(
		&user.ID,
		&user.CreatedAt,
		&user.UpdatedAt,
	)
	return err
}

func (r *UserRepository) UpdateProfile(ctx context.Context, user *domain.User) error {
	query := `
		UPDATE users
		SET display_name = $1, avatar_url = $2, class_name = $3, updated_at = NOW()
		WHERE id = $4`

	_, err := r.pool.Exec(ctx, query, user.DisplayName, user.AvatarURL, user.ClassName, user.ID)
	return err
}
