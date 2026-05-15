BEGIN;

CREATE TABLE IF NOT EXISTS criteria (
    id UUID PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    max_score INTEGER NOT NULL DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS activity_criteria (
    id UUID PRIMARY KEY,
    activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    criteria_id UUID NOT NULL REFERENCES criteria(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    score INTEGER NOT NULL DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(activity_id, criteria_id)
);

INSERT INTO criteria (id, code, title, description, max_score)
VALUES
    ('41000000-0000-4000-8000-000000000001', 'DAO_DUC', 'Tiêu chí Đạo đức tốt', 'Nhóm tiêu chí về đạo đức, lối sống và trách nhiệm.', 100),
    ('41000000-0000-4000-8000-000000000002', 'HOC_TAP', 'Tiêu chí Học tập tốt', 'Nhóm tiêu chí về học tập, nghiên cứu và thành tích học thuật.', 100),
    ('41000000-0000-4000-8000-000000000003', 'THE_LUC', 'Tiêu chí Thể lực tốt', 'Nhóm tiêu chí về rèn luyện sức khỏe và thể chất.', 100),
    ('41000000-0000-4000-8000-000000000004', 'TINH_NGUYEN', 'Tiêu chí Tình nguyện tốt', 'Nhóm tiêu chí về tham gia hoạt động cộng đồng và tình nguyện.', 100),
    ('41000000-0000-4000-8000-000000000005', 'HOI_NHAP', 'Tiêu chí Hội nhập tốt', 'Nhóm tiêu chí về giao lưu, hội nhập và năng lực quốc tế.', 100)
ON CONFLICT (code) DO UPDATE
SET title = EXCLUDED.title,
    description = EXCLUDED.description,
    max_score = EXCLUDED.max_score,
    updated_at = NOW();

WITH criteria_map AS (
    SELECT *
    FROM (VALUES
        ('40000000-0000-4000-8000-000000000001'::uuid, 'DAO_DUC'::varchar, 'Tiêu chí Đạo đức tốt'::varchar, 'Tiêu chí áp dụng cho hoạt động Lý tưởng Sinh viên 2026.'::text, 100::integer),
        ('40000000-0000-4000-8000-000000000002'::uuid, 'DAO_DUC'::varchar, 'Tiêu chí Đạo đức tốt'::varchar, 'Tiêu chí áp dụng cho hoạt động Nghị quyết Đại hội XIV.'::text, 100::integer),
        ('40000000-0000-4000-8000-000000000003'::uuid, 'TINH_NGUYEN'::varchar, 'Tiêu chí Tình nguyện tốt'::varchar, 'Tiêu chí áp dụng cho dự án Phất Quạt Họa Văn.'::text, 100::integer),
        ('40000000-0000-4000-8000-000000000004'::uuid, 'THE_LUC'::varchar, 'Tiêu chí Thể lực tốt'::varchar, 'Tiêu chí áp dụng cho Bước chân Sinh viên - Giải chạy vRace.'::text, 100::integer),
        ('40000000-0000-4000-8000-000000000005'::uuid, 'HOC_TAP'::varchar, 'Tiêu chí Học tập tốt'::varchar, 'Tiêu chí áp dụng cho Đại sứ Văn hóa Đọc 2025.'::text, 100::integer),
        ('40000000-0000-4000-8000-000000000006'::uuid, 'TINH_NGUYEN'::varchar, 'Tiêu chí Tình nguyện tốt'::varchar, 'Tiêu chí phụ áp dụng cho Đại sứ Văn hóa Đọc 2025.'::text, 100::integer)
    ) AS t(criteria_doc_id, criteria_code, title, description, score)
)
INSERT INTO activity_criteria (id, activity_id, criteria_id, title, description, score)
SELECT
    cd.id,
    cd.activity_id,
    c.id,
    m.title,
    m.description,
    m.score
FROM criteria_docs cd
JOIN criteria_map m ON m.criteria_doc_id = cd.id
JOIN criteria c ON c.code = m.criteria_code
ON CONFLICT (activity_id, criteria_id) DO UPDATE
SET title = EXCLUDED.title,
    description = EXCLUDED.description,
    score = EXCLUDED.score,
    updated_at = NOW();

UPDATE evidences e
SET criterion_type = m.criteria_code
FROM (
    VALUES
        ('40000000-0000-4000-8000-000000000001'::uuid, 'TINH_NGUYEN'::varchar),
        ('40000000-0000-4000-8000-000000000002'::uuid, 'HOC_TAP'::varchar),
        ('40000000-0000-4000-8000-000000000003'::uuid, 'TINH_NGUYEN'::varchar),
        ('40000000-0000-4000-8000-000000000004'::uuid, 'THE_LUC'::varchar),
        ('40000000-0000-4000-8000-000000000005'::uuid, 'HOC_TAP'::varchar),
        ('40000000-0000-4000-8000-000000000006'::uuid, 'TINH_NGUYEN'::varchar)
) AS m(criteria_doc_id, criteria_code)
WHERE e.criteria_doc_id = m.criteria_doc_id;

COMMIT;