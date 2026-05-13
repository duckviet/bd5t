# PROJECT_CONTEXT.md

# Project Context

## Dự án: Bản đồ 5 Tốt

## 1. Product Summary

"Bản đồ 5 Tốt" là nền tảng web hỗ trợ sinh viên Trường Đại học Ngoại ngữ – ĐHQGHN theo dõi hành trình hoàn thành danh hiệu "Sinh viên 5 Tốt".

Hệ thống giúp:

- tra cứu tiêu chí
- tìm kiếm hoạt động phù hợp
- lưu trữ minh chứng/chứng chỉ
- theo dõi tiến độ hoàn thành
- nhận thông báo và gợi ý hoạt động

Website không trực tiếp tổ chức hoạt động. Khi sinh viên chọn tham gia một hoạt động, hệ thống chỉ điều hướng sang link chính thức của hoạt động đó.

## 2. Product Goals

- Số hóa quá trình theo dõi "Sinh viên 5 Tốt"
- Giúp sinh viên dễ biết mình còn thiếu tiêu chí nào
- Tập trung một nơi để lưu chứng chỉ/minh chứng
- Hỗ trợ cán bộ Hội/Đoàn quản lý dữ liệu hoạt động và minh chứng
- Tăng khả năng tiếp cận các hoạt động phù hợp

## 3. Target Users

### 3.1 Sinh viên

Có thể:

- đăng ký / đăng nhập
- xem tài liệu tiêu chí
- xem danh sách hoạt động
- xem chi tiết hoạt động
- bấm link chính thức để tham gia
- nộp minh chứng
- xem tiến độ
- xem thông báo
- quản lý hồ sơ

### 3.2 Quản trị viên

Có thể:

- quản lý hoạt động
- quản lý tài liệu tiêu chí
- duyệt minh chứng
- quản lý thông báo
- xem thống kê cơ bản
- quản lý người dùng

## 4. Core Modules

- Authentication
- Home
- Criteria Documents
- Activities
- Notifications
- Profile
- Evidence Vault
- Progress Tracking
- Admin Dashboard

## 5. MVP Scope

### In scope for MVP

- đăng ký / đăng nhập
- hồ sơ cá nhân
- danh sách hoạt động
- chi tiết hoạt động
- tìm kiếm và lọc hoạt động theo tiêu chí
- nộp minh chứng
- quản lý minh chứng
- hiển thị tiến độ cơ bản
- xem tài liệu PDF tiêu chí
- thông báo cơ bản
- admin CRUD hoạt động
- admin duyệt minh chứng
- leaderboard cơ bản

### Out of scope for MVP

- hệ thống xét duyệt danh hiệu thực tế
- email notification production-grade
- AI recommendation engine phức tạp
- chat / messaging
- mobile app
- thanh toán
- tích hợp SSO trường
- analytics nâng cao
- WebGL cao cấp nếu ảnh hưởng tiến độ

## 6. Business Value

Đối với sinh viên:

- giảm việc thất lạc minh chứng
- chủ động trong việc hoàn thành tiêu chí
- dễ tiếp cận hoạt động phù hợp

Đối với nhà trường / Đoàn Hội:

- tăng khả năng quản lý dữ liệu
- hỗ trợ chuyển đổi số
- có cái nhìn tổng quan về mức độ tham gia

## 7. Primary Success Metrics

- số lượng sinh viên đăng ký
- số lượng minh chứng được nộp
- số lượng hoạt động được cập nhật
- số sinh viên có tiến độ được ghi nhận
- tỷ lệ sinh viên quay lại sử dụng hệ thống

## 8. Assumptions

- hoạt động sẽ được nhập thủ công bởi admin
- link đăng ký hoạt động là link ngoài hệ thống
- minh chứng được admin duyệt
- tiến độ được tính dựa trên dữ liệu hợp lệ hoặc rule cấu hình
- dữ liệu ban đầu có thể là mock data trong giai đoạn đầu

## 9. Constraints

- stack FE bắt buộc:
  - Next.js
  - TypeScript
  - Tailwind CSS
  - shadcn/ui
  - TanStack Query
  - GSAP
- ưu tiên phát triển theo MVP
- UI phải bám design system đã chốt
- không thêm tính năng ngoài scope nếu chưa có chỉ định

## 10. Stakeholder Notes

- hệ thống mang tính hỗ trợ và theo dõi, không thay thế quy trình xét danh hiệu chính thức
- cần ưu tiên trải nghiệm dễ dùng cho sinh viên
- admin panel chỉ cần đủ dùng, không cần over-engineer ở MVP
