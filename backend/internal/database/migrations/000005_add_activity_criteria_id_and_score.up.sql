BEGIN;

-- 1) Add new nullable columns
ALTER TABLE evidences
  ADD COLUMN IF NOT EXISTS activity_criteria_id UUID NULL,
  ADD COLUMN IF NOT EXISTS score INTEGER NULL;

-- 2) Index for new FK column to help query performance
CREATE INDEX IF NOT EXISTS idx_evidences_activity_criteria_id ON evidences(activity_criteria_id);

-- 3) Backfill activity_criteria_id where a direct mapping exists
-- The criteria refactor migration used criteria_docs.id as activity_criteria.id for seeded rows,
-- so we can map evidences.criteria_doc_id -> activity_criteria.id when they match.
UPDATE evidences e
SET activity_criteria_id = e.criteria_doc_id
FROM activity_criteria ac
WHERE e.criteria_doc_id IS NOT NULL
  AND ac.id = e.criteria_doc_id;

-- 4) Record any evidences that could not be mapped for manual review.
CREATE TABLE IF NOT EXISTS evidence_backfill_review (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evidence_id UUID NOT NULL,
  criteria_doc_id UUID,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

INSERT INTO evidence_backfill_review (evidence_id, criteria_doc_id, note)
SELECT e.id, e.criteria_doc_id, 'no matching activity_criteria.id found; set activity_criteria_id NULL'
FROM evidences e
LEFT JOIN activity_criteria ac ON ac.id = e.criteria_doc_id
WHERE e.criteria_doc_id IS NOT NULL AND ac.id IS NULL;

COMMIT;
