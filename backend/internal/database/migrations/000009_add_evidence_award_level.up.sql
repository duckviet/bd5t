BEGIN;

ALTER TABLE evidences
  ADD COLUMN IF NOT EXISTS award_level VARCHAR(32) NULL;

CREATE INDEX IF NOT EXISTS idx_evidences_award_level ON evidences(award_level);

COMMIT;
