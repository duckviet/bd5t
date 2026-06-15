# Plan: Tính điểm 5 tiêu chí cho polygon chart

## Summary
Triển khai hệ thống điểm 5 trục theo bảng tiêu chí đã cung cấp, dùng chung cho profile và leaderboard detail. Quy tắc đã khóa: điểm trong mỗi tiêu chí = điểm tham gia + điểm giải, cap tối đa `200`; admin trao giải theo từng minh chứng/sinh viên; polygon chart hiển thị ở cả profile và leaderboard.

## Key Changes
- Backend thêm mô hình điểm có cấu trúc:
  - `awardLevel`: `NONE | KHUYEN_KHICH | BA | NHI | NHAT`.
  - `criteriaScores`: mảng 5 phần tử `{ criteria, label, score, maxScore: 200, participationScore, awardScore, approvedActivityCount, awardLevel }`.
  - Giữ `evidences.score` nhưng biến thành điểm hệ thống tính, không để admin nhập tự do.
- Thêm migration cho `evidences.award_level` nullable, index theo `user_id/status/criterion_type/award_level`; không phá dữ liệu cũ.
- Cập nhật OpenAPI trước, chạy generator sau:
  - Mở rộng `ReviewEvidenceRequest` để nhận `awardLevel`.
  - Mở rộng `EvidenceItem`, `ProgressMatrix`, `LeaderboardCriteriaStat` để trả điểm polygon.
  - Nếu cần chỉnh sau duyệt, thêm endpoint admin `PATCH /admin/evidences/{id}/award`.
- Backend scoring:
  - `DAO_DUC`, `HOC_TAP`, `THE_LUC`, `HOI_NHAP`: participation `50` nếu 1 hoạt động, `100` nếu từ 2 hoạt động; award cao nhất trong tiêu chí: Khuyến khích `85`, Ba `90`, Nhì `95`, Nhất `100`; tổng cap `200`.
  - `THE_LUC` dùng cùng rule nhóm thường.
  - `TINH_NGUYEN`: 1 hoạt động `80`, 3 hoạt động `120`, 5 hoạt động `200`; không cộng award.
  - Chỉ tính minh chứng `approved`; mỗi `activity_id` chỉ đếm một lần trong participation của một tiêu chí.
- Admin UI:
  - Trong panel duyệt minh chứng thêm select “Cấp giải” chỉ bật khi duyệt.
  - Hiển thị điểm dự kiến trước khi submit.
  - Với minh chứng đã duyệt, admin có thể sửa cấp giải qua cùng panel hoặc endpoint award riêng.
- Frontend chart:
  - Profile gọi `useGetProgress` để lấy `criteriaScores`, không tự suy luận điểm từ evidence list.
  - Leaderboard detail đổi radar chart từ `approvedActivities` sang `score/maxScore`.
  - Tooltip/legend hiển thị: điểm tổng, điểm tham gia, điểm giải, số hoạt động đã duyệt.

## Test Plan
- Backend unit tests:
  - `backend/internal/service/impl/scoring_service_test.go`: additive + cap `200`, threshold tình nguyện `0/80/120/200`, award cao nhất thắng, duplicate activity không double-count.
  - `backend/internal/service/impl/admin_service_test.go`: duyệt minh chứng với `awardLevel` cập nhật evidence, tính score, recalc progress.
  - `backend/internal/service/impl/leaderboard_service_test.go`: `criteriaStats` trả đủ 5 tiêu chí với score/maxScore.
- Backend integration/HTTP QA:
  - `PATCH /admin/evidences/{id}` approved + `awardLevel: "NHAT"` trả evidence có `awardLevel` và `score`.
  - `GET /progress` trả `criteriaScores` có tiêu chí đạt tối đa `200` khi đủ tham gia + giải.
  - `GET /leaderboard/{studentId}` trả radar data bằng điểm, không chỉ số hoạt động.
- Frontend checks:
  - `npm run lint`, `npm run build`.
  - Browser QA profile: polygon hiển thị 5 trục, điểm đúng theo API fixture.
  - Browser QA admin: chọn cấp giải, duyệt, toast thành công, điểm cập nhật sau refetch.
  - Browser QA leaderboard detail: chart scale theo `maxScore: 200`.

## Assumptions
- `evidences.score` được giữ để tương thích bảng xếp hạng hiện tại, nhưng nguồn truth nghiệp vụ là `award_level` + scoring service.
- Bulk review không trao giải hàng loạt trong v1; bulk approve dùng `awardLevel = NONE` để tránh gán nhầm giải.
- Nếu một hoạt động gắn nhiều tiêu chí, minh chứng chỉ cộng vào tiêu chí cụ thể khi có `activityCriteriaId`/`criterionType`; nếu thiếu, dùng danh sách criteria của activity như logic hiện tại.
