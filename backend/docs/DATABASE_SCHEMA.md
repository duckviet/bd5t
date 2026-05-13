# DATABASE_SCHEMA.md (Backend)

# Database Schema

## Dự án: Bản đồ 5 Tốt

Tài liệu này mô tả chi tiết cấu trúc cơ sở dữ liệu hiện tại của Backend (dựa trên các file migration SQL). 

> [!NOTE]
> Hiện tại có sự lệch nhẹ giữa schema thực tế của Backend và tài liệu schema của Frontend. Các phần đánh dấu ⚠️ là các trường/thực thể cần được cập nhật để đồng bộ.

## 1. Overview

Schema hiện tại phục vụ các tính năng MVP:
- Quản lý người dùng và phân quyền (Users)
- Quản lý đơn vị/khoa (Units)
- Quản lý hoạt động 5 tốt (Activities)
- Quản lý tiêu chí hoạt động (Criteria Docs)
- Quản lý bằng chứng sinh viên nộp (Evidences)
- Theo dõi tiến độ (Progress)
- Thông báo (Notifications)
- Bảng xếp hạng (Leaderboard)

## 2. Tables

### 2.1. users

Lưu trữ thông tin người dùng.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID (PK) | Khóa chính, mặc định `gen_random_uuid()` |
| `email` | VARCHAR(255) | Email đăng nhập, duy nhất |
| `password_hash` | VARCHAR(255) | Hash mật khẩu |
| `student_id` | VARCHAR(50) | Mã số sinh viên, duy nhất |
| `display_name` | VARCHAR(255) | Tên hiển thị (⚠️ FE dùng `fullName`) |
| `avatar_url` | VARCHAR(512) | Ảnh đại diện |
| `role` | VARCHAR(20) | Vai trò: `student`, `admin` (mặc định `student`) |
| `created_at` | TIMESTAMP | Thời gian tạo |
| `updated_at` | TIMESTAMP | Thời gian cập nhật |

**⚠️ Gaps:**
- Thiếu `unit_id` (Khóa ngoại tham chiếu `units.id`)
- Thiếu `class_name`

---

### 2.2. units

Quản lý các khoa/đơn vị.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID (PK) | Khóa chính |
| `name` | VARCHAR(255) | Tên đơn vị |
| `code` | VARCHAR(50) | Mã đơn vị, duy nhất (ví dụ: ENG, JPN) |
| `description` | TEXT | Mô tả đơn vị |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |

---

### 2.3. activities

Quản lý các hoạt động 5 tốt.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID (PK) | Khóa chính |
| `title` | VARCHAR(255) | Tiêu đề hoạt động |
| `description` | TEXT | Mô tả chi tiết |
| `location` | TEXT | Địa điểm tổ chức |
| `target_audience` | TEXT | Đối tượng tham gia |
| `rules` | TEXT | Thể lệ/luật thi |
| `rewards` | TEXT | Giải thưởng/quyền lợi |
| `contact_info` | TEXT | Thông tin liên hệ |
| `unit_id` | UUID (FK) | Đơn vị tổ chức (tham chiếu `units.id`) |
| `start_date` | DATE | Ngày bắt đầu |
| `end_date` | DATE | Ngày kết thúc |
| `is_active` | BOOLEAN | Trạng thái hoạt động (mặc định `true`) |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |

**⚠️ Gaps:**
- Thiếu `slug` (Dùng cho URL thân thiện ở FE)
- Thiếu `thumbnail_url`
- Thiếu `short_description`
- Thiếu `registration_url`
- Thiếu `review_level` (Cấp trường, ĐHQG, v.v.)
- Cấu trúc tiêu chí đang dùng bảng `criteria_docs` thay vì join table như FE đề xuất.

**Cập nhật:**
- `location`, `target_audience`, `rules`, `rewards`, `contact_info` đã được bổ sung vào schema backend.
- `organizer` cũng đã có trong schema backend.

---

### 2.4. criteria_docs

Tài liệu/Tiêu chí cụ thể cho từng hoạt động.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID (PK) | |
| `activity_id` | UUID (FK) | Tham chiếu `activities.id` |
| `title` | VARCHAR(255) | Tiêu đề tiêu chí |
| `description` | TEXT | Mô tả tiêu chí |
| `max_score` | INTEGER | Điểm tối đa (mặc định 100) |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |

---

### 2.5. evidences

Bằng chứng nộp bởi sinh viên.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID (PK) | |
| `user_id` | UUID (FK) | Người nộp (tham chiếu `users.id`) |
| `activity_id` | UUID (FK) | Hoạt động liên quan (tham chiếu `activities.id`) |
| `criteria_doc_id` | UUID (FK) | Tiêu chí liên quan (tham chiếu `criteria_docs.id`) |
| `file_url` | VARCHAR(512) | Đường dẫn file trên storage |
| `file_key` | VARCHAR(255) | Key file để quản lý trên S3/R2 |
| `description` | TEXT | Mô tả từ sinh viên |
| `status` | VARCHAR(20) | `pending`, `approved`, `rejected` |
| `review_note` | TEXT | Ghi chú từ người duyệt |
| `reviewed_by` | UUID (FK) | Người duyệt (tham chiếu `users.id`) |
| `reviewed_at` | TIMESTAMP | |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |

**⚠️ Gaps:**
- Thiếu trường `criterion_type` (DAO_DUC, HOC_TAP...) để phân loại.

---

### 2.6. progress

Theo dõi tiến độ hoàn thành tiêu chí của từng sinh viên theo hoạt động.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID (PK) | |
| `user_id` | UUID (FK) | |
| `activity_id` | UUID (FK) | |
| `total_score` | INTEGER | Tổng điểm đạt được |
| `completed_criteria`| JSONB | Danh sách các tiêu chí đã hoàn thiện |
| `updated_at` | TIMESTAMP | |

---

### 2.7. notifications

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID (PK) | |
| `user_id` | UUID (FK) | Người nhận |
| `title` | VARCHAR(255) | |
| `message` | TEXT | |
| `type` | VARCHAR(50) | Loại thông báo |
| `is_read` | BOOLEAN | Trạng thái đã đọc |
| `data` | JSONB | Dữ liệu đính kèm |
| `created_at` | TIMESTAMP | |

---

### 2.8. leaderboard_snapshots

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID (PK) | |
| `user_id` | UUID (FK) | |
| `unit_id` | UUID (FK) | |
| `total_approved` | INTEGER | Số lượng bằng chứng được duyệt |
| `total_score` | INTEGER | Tổng điểm |
| `rank` | INTEGER | Thứ hạng tại thời điểm chụp |
| `snapshot_date` | DATE | Ngày ghi nhận |
| `created_at` | TIMESTAMP | |

## 3. Gap Analysis & Synchronization Tasks

Để đồng bộ với Frontend, các công việc sau cần được thực hiện trong Backend:

1. **Users Table:**
   - [ ] Thêm `unit_id` và `class_name`.
   - [ ] Đổi tên `display_name` thành `full_name` (hoặc map ở tầng API).

2. **Activities Table:**
   - [ ] Thêm `slug`, `thumbnail_url`, `short_description`, `registration_url`.
   - [ ] Thêm `review_level` và `organizer`.
   - [ ] Cân nhắc chuyển sang quan hệ Many-to-Many cho `CriterionType`.

3. **Evidence Table:**
   - [ ] Thêm `criterion_type` để FE hiển thị đúng phân loại 5 tốt.

4. **Enums:**
   - [ ] Đồng bộ bộ giá trị cho `CriterionType` (DAO_DUC, HOC_TAP, THE_LUC, TINH_NGUYEN, HOI_NHAP).
   - [ ] Đồng bộ bộ giá trị cho `ReviewLevel` (TRUONG, DHQGHN, THANH_PHO, TRUNG_UONG).
