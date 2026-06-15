BEGIN;

DROP INDEX IF EXISTS idx_evidences_award_level;

ALTER TABLE evidences
  DROP COLUMN IF EXISTS award_level;

COMMIT;
