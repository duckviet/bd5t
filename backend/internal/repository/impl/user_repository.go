package impl

import (
	"context"
	"errors"

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

func (r *UserRepository) Create(ctx context.Context, user *domain.User) error {
	query := `
		INSERT INTO users (email, password_hash, student_id, display_name, role)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, created_at, updated_at`

	var studentID *string
	if user.StudentID != nil {
		studentID = user.StudentID
	}

	var displayName *string
	if user.DisplayName != nil {
		displayName = user.DisplayName
	}

	role := domain.RoleStudent
	if user.Role != "" {
		role = user.Role
	}

	err := r.pool.QueryRow(ctx, query, user.Email, user.PasswordHash, studentID, displayName, role).Scan(
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
