<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Bản đồ 5 Tốt — Agent Instructions

## Project Overview
Web app quản lý tiêu chí Sinh viên 5 Tốt - ĐHQGHN.
Stack: Next.js 15/16, PostgreSQL, Prisma, JWT (access + refresh token).

## Key Docs (Read when relevant)
- **Architecture**: [docs/ARCHITECTURE.md](file:///home/duckviet/bd5t/docs/ARCHITECTURE.md)
- **API Spec**: [docs/API_SPEC.md](file:///home/duckviet/bd5t/docs/API_SPEC.md)
- **DB Schema**: [docs/DATABASE_SCHEMA.md](file:///home/duckviet/bd5t/docs/DATABASE_SCHEMA.md)
- **Tasks**: [docs/TASKS.md](file:///home/duckviet/bd5t/docs/TASKS.md)

## Build & Dev Commands
- **Install**: `npm install`
- **Dev**: `npm run dev`
- **Lint**: `npm run lint`
- **Build**: `npm run build`
- **Prisma (khi có)**: `npx prisma migrate dev`, `npx prisma studio`

## Development Rules
- **Authentication**: 
    - `access_token` gửi trong header `Authorization: Bearer <token>`.
    - `refresh_token` lưu trong **HttpOnly cookie**.
    - Endpoint refresh: `POST /api/auth/refresh`.
- **API Response Standard**:
    - Success: `{ "success": true, "data": { ... } }`
    - Error: `{ "success": false, "error": { "code": "ERR_CODE", "message": "..." } }`
- **Database**: Không tự ý thay đổi DB schema (Prisma model) mà không có sự đồng ý của người dùng.
- **UI/UX**: Sử dụng Tailwind CSS và shadcn/ui. Ưu tiên thẩm mỹ cao (Rich Aesthetics) theo tiêu chuẩn Antigravity.

## Antigravity Workflow
- Sử dụng **Plan Mode** cho các task lớn (sinh implementation plan trước).
- Luôn cập nhật **[TASKS.md](file:///home/duckviet/bd5t/docs/TASKS.md)** sau khi hoàn thành mỗi task.
- Tạo **Artifacts** để báo cáo kết quả verify (screenshot/recording nếu cần).
