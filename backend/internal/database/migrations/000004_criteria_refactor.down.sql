BEGIN;

UPDATE evidences
SET criterion_type = NULL;

DROP TABLE IF EXISTS activity_criteria;
DROP TABLE IF EXISTS criteria;

COMMIT;