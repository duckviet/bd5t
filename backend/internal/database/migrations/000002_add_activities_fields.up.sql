-- Add new fields to activities table to align with Frontend
ALTER TABLE activities ADD COLUMN IF NOT EXISTS slug VARCHAR(255) UNIQUE;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS thumbnail_url VARCHAR(512);
ALTER TABLE activities ADD COLUMN IF NOT EXISTS short_description VARCHAR(500);
ALTER TABLE activities ADD COLUMN IF NOT EXISTS registration_url VARCHAR(512);
ALTER TABLE activities ADD COLUMN IF NOT EXISTS review_level VARCHAR(50) DEFAULT 'TRUONG';
ALTER TABLE activities ADD COLUMN IF NOT EXISTS organizer VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_activities_slug ON activities(slug);
CREATE INDEX IF NOT EXISTS idx_activities_is_active_slug ON activities(is_active, slug);

-- Add unit_id to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS unit_id UUID REFERENCES units(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS class_name VARCHAR(255);

-- Add criterion_type to evidences table
ALTER TABLE evidences ADD COLUMN IF NOT EXISTS criterion_type VARCHAR(50) DEFAULT 'HOC_TAP';