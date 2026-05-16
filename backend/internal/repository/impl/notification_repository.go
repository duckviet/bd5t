package impl

import (
	"context"
	"encoding/json"
	"errors"

	"github.com/duckviet/bd5t/backend/internal/domain"
	"github.com/duckviet/bd5t/backend/internal/repository/interfaces"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type NotificationRepository struct {
	pool *pgxpool.Pool
}

func NewNotificationRepository(pool *pgxpool.Pool) *NotificationRepository {
	return &NotificationRepository{pool: pool}
}

var _ interfaces.NotificationRepository = (*NotificationRepository)(nil)

func (r *NotificationRepository) ListByUser(ctx context.Context, userID string) ([]*domain.Notification, error) {
	query := `
		SELECT id, user_id, title, message, type, is_read, data, created_at
		FROM notifications
		WHERE user_id = $1
		ORDER BY created_at DESC`

	rows, err := r.pool.Query(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	notifications := make([]*domain.Notification, 0)
	for rows.Next() {
		notification, err := scanNotification(rows)
		if err != nil {
			return nil, err
		}
		notifications = append(notifications, notification)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	return notifications, nil
}

func (r *NotificationRepository) Create(ctx context.Context, notification *domain.Notification) error {
	dataBytes, err := json.Marshal(notification.Data)
	if err != nil {
		return err
	}

	query := `
		INSERT INTO notifications (user_id, title, message, type, is_read, data)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, created_at`

	return r.pool.QueryRow(
		ctx,
		query,
		notification.UserID,
		notification.Title,
		notification.Message,
		notification.Type,
		notification.IsRead,
		dataBytes,
	).Scan(&notification.ID, &notification.CreatedAt)
}

func (r *NotificationRepository) MarkRead(ctx context.Context, userID string, notificationID string) (*domain.Notification, error) {
	query := `
		UPDATE notifications
		SET is_read = TRUE
		WHERE id = $1 AND user_id = $2
		RETURNING id, user_id, title, message, type, is_read, data, created_at`

	notification, err := scanNotification(r.pool.QueryRow(ctx, query, notificationID, userID))
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	return notification, nil
}

func (r *NotificationRepository) MarkAllRead(ctx context.Context, userID string) (int64, error) {
	commandTag, err := r.pool.Exec(ctx, `
		UPDATE notifications
		SET is_read = TRUE
		WHERE user_id = $1 AND is_read = FALSE`, userID)
	if err != nil {
		return 0, err
	}

	return commandTag.RowsAffected(), nil
}

type notificationScanner interface {
	Scan(dest ...interface{}) error
}

func scanNotification(scanner notificationScanner) (*domain.Notification, error) {
	var notification domain.Notification
	var dataBytes []byte

	err := scanner.Scan(
		&notification.ID,
		&notification.UserID,
		&notification.Title,
		&notification.Message,
		&notification.Type,
		&notification.IsRead,
		&dataBytes,
		&notification.CreatedAt,
	)
	if err != nil {
		return nil, err
	}

	if len(dataBytes) > 0 {
		if err := json.Unmarshal(dataBytes, &notification.Data); err != nil {
			return nil, err
		}
	}
	if notification.Data == nil {
		notification.Data = map[string]interface{}{}
	}

	return &notification, nil
}
