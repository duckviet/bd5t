BEGIN;

-- Remove review table
DROP TABLE IF EXISTS evidence_backfill_review;

-- Drop index
DROP INDEX IF EXISTS idx_evidences_activity_criteria_id;

-- Drop columns
ALTER TABLE evidences
  DROP COLUMN IF EXISTS activity_criteria_id,
  DROP COLUMN IF EXISTS score;

COMMIT;
