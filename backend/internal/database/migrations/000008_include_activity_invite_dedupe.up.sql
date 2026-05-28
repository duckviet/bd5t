DROP INDEX IF EXISTS idx_notifications_activity_batch_dedupe;

CREATE UNIQUE INDEX IF NOT EXISTS idx_notifications_activity_batch_dedupe
ON notifications (
    user_id,
    type,
    (data->>'activityId'),
    (data->>'batchKey')
)
WHERE type IN ('ACTIVITY_NEW', 'ACTIVITY_DEADLINE_SOON', 'SUGGESTION', 'ACTIVITY_INVITE')
  AND data ? 'activityId'
  AND data ? 'batchKey';
