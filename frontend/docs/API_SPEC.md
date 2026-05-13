# API_SPEC.md

# API Specification

## Dự án: Bản đồ 5 Tốt

## 1. General Rules

- Base path: `/api`
- Data format: JSON
- Authenticated endpoints require session or token
- Errors return consistent JSON shape

### Standard success response

```json
{
  "success": true,
  "data": {}
}
```

````

### Standard error response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input"
  }
}
```

## 2. Authentication APIs

### Cơ chế Token

- **Access Token**: JWT short-lived (vd: 15 phút), gửi trong header `Authorization: Bearer <access_token>` với mọi request cần xác thực.
- **Refresh Token**: Long-lived (vd: 7 ngày), lưu trong **HttpOnly cookie** (`refresh_token`). Dùng để cấp access token mới mà không cần đăng nhập lại.
- Khi access token hết hạn, client gọi `POST /api/auth/refresh` để lấy token mới.
- Khi logout hoặc refresh token hết hạn/bị thu hồi → yêu cầu đăng nhập lại.

---

### 2.1 Register

`POST /api/auth/register`

Request:
```json
{
  "fullName": "Nguyen Van A",
  "email": "a@example.com",
  "studentId": "22040001",
  "className": "K56A",
  "unitId": "unit_1",
  "password": "password123",
  "confirmPassword": "password123"
}
```

Response `201`:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_1",
      "fullName": "Nguyen Van A",
      "email": "a@example.com",
      "role": "STUDENT"
    }
  }
}
```

> Không tự động đăng nhập sau register. Client redirect sang trang login.

---

### 2.2 Login

`POST /api/auth/login`

Request:
```json
{
  "identifier": "a@example.com",
  "password": "password123"
}
```

Response `200`:
```json
{
  "success": true,
  "data": {
    "accessToken": "<jwt_access_token>",
    "expiresIn": 900,
    "user": {
      "id": "user_1",
      "fullName": "Nguyen Van A",
      "role": "STUDENT"
    }
  }
}
```

> Server đồng thời **set HttpOnly cookie** `refresh_token=<jwt_refresh_token>; Path=/api/auth/refresh; HttpOnly; Secure; SameSite=Strict; Max-Age=604800`

---

### 2.3 Refresh Token

`POST /api/auth/refresh`

- Không cần body. Server đọc `refresh_token` từ cookie.
- Nếu refresh token hợp lệ và chưa bị thu hồi → cấp access token mới.
- Server nên **rotate refresh token** mỗi lần refresh (thu hồi token cũ, cấp token mới).

Response `200`:
```json
{
  "success": true,
  "data": {
    "accessToken": "<new_jwt_access_token>",
    "expiresIn": 900
  }
}
```

> Cookie `refresh_token` được set lại với token mới (nếu rotate).

Error khi refresh token hết hạn hoặc không hợp lệ `401`:
```json
{
  "success": false,
  "error": {
    "code": "REFRESH_TOKEN_INVALID",
    "message": "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại"
  }
}
```

---

### 2.4 Logout

`POST /api/auth/logout`

- Header: `Authorization: Bearer <access_token>`
- Server **thu hồi refresh token** (thêm vào blacklist hoặc xóa khỏi DB).
- Server **clear cookie** `refresh_token`.

Response `200`:
```json
{
  "success": true,
  "data": {
    "loggedOut": true
  }
}
```

---

### 2.5 Current User

`GET /api/auth/me`

- Header: `Authorization: Bearer <access_token>`

Response `200`:
```json
{
  "success": true,
  "data": {
    "id": "user_1",
    "fullName": "Nguyen Van A",
    "email": "a@example.com",
    "studentId": "22040001",
    "className": "K56A",
    "unit": {
      "id": "unit_1",
      "name": "Khoa Ngôn ngữ & Văn hóa Anh"
    },
    "role": "STUDENT",
    "avatarUrl": null
  }
}
```

---

### Token Error Responses (chung)

| HTTP | `error.code` | Mô tả |
|---|---|---|
| `401` | `TOKEN_MISSING` | Không có Authorization header |
| `401` | `TOKEN_INVALID` | Token sai chữ ký hoặc malformed |
| `401` | `TOKEN_EXPIRED` | Access token hết hạn → client gọi `/refresh` |
| `401` | `REFRESH_TOKEN_INVALID` | Refresh token hết hạn / bị thu hồi |
| `403` | `FORBIDDEN` | Token hợp lệ nhưng không đủ quyền |

---

### Ghi chú triển khai

- **Lưu access token**: `memory` (biến JS) hoặc `sessionStorage` — **không** dùng `localStorage` để tránh XSS.
- **Refresh token** nằm trong HttpOnly cookie, JS không đọc được, chống XSS.
- Client nên implement **silent refresh**: trước khi access token hết hạn (`expiresIn - delta`), tự động gọi `/refresh` để lấy token mới mà người dùng không hay.
- Server cần lưu refresh token vào DB (bảng `RefreshToken` với `userId`, `tokenHash`, `expiresAt`, `revokedAt`) để hỗ trợ logout và rotation.

## 3. Unit APIs

### 3.1 Get Units

`GET /api/units`

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "unit_1",
      "name": "Khoa Ngôn ngữ & Văn hóa Anh",
      "code": "ENG"
    }
  ]
}
```

## 4. Activity APIs

### 4.1 Get Activities

`GET /api/activities?q=&criterion=&page=&pageSize=`

Query params:

- `q`: string
- `criterion`: `DAO_DUC | HOC_TAP | THE_LUC | TINH_NGUYEN | HOI_NHAP`
- `page`: number
- `pageSize`: number

Response:

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "act_1",
        "title": "Cuộc thi Lý tưởng Sinh viên",
        "slug": "cuoc-thi-ly-tuong-sinh-vien",
        "thumbnailUrl": "/images/a.jpg",
        "criteria": ["DAO_DUC"],
        "organizer": "Đoàn Thanh niên",
        "registrationUrl": "https://example.com",
        "startAt": "2026-06-01T00:00:00.000Z",
        "endAt": "2026-06-20T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 12,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

### 4.2 Get Activity Detail

`GET /api/activities/:slug`

Response:

```json
{
  "success": true,
  "data": {
    "id": "act_1",
    "title": "Cuộc thi Lý tưởng Sinh viên",
    "slug": "cuoc-thi-ly-tuong-sinh-vien",
    "thumbnailUrl": "/images/a.jpg",
    "description": "Mô tả...",
    "rules": "Thể lệ...",
    "rewards": "Cơ cấu giải thưởng...",
    "criteria": ["DAO_DUC"],
    "organizer": "Đoàn Thanh niên",
    "contactInfo": "contact@example.com",
    "registrationUrl": "https://example.com",
    "startAt": "2026-06-01T00:00:00.000Z",
    "endAt": "2026-06-20T00:00:00.000Z",
    "reviewLevel": "TRUONG"
  }
}
```

## 5. Criteria Document APIs

### 5.1 Get Criteria Docs

`GET /api/criteria-docs`

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "doc_1",
      "title": "Quy định xét chọn cấp Trường",
      "reviewLevel": "TRUONG",
      "fileUrl": "https://example.com/doc.pdf"
    }
  ]
}
```

## 6. Notification APIs

### 6.1 Get Notifications

`GET /api/notifications`

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "noti_1",
      "title": "Hoạt động mới",
      "message": "Có hoạt động mới thuộc tiêu chí Hội nhập tốt",
      "type": "ACTIVITY_NEW",
      "isRead": false,
      "createdAt": "2026-05-11T00:00:00.000Z"
    }
  ]
}
```

### 6.2 Mark Notification Read

`PATCH /api/notifications/:id/read`

Response:

```json
{
  "success": true,
  "data": {
    "id": "noti_1",
    "isRead": true
  }
}
```

## 7. Profile APIs

### 7.1 Get My Profile

`GET /api/profile`

Response:

```json
{
  "success": true,
  "data": {
    "id": "user_1",
    "fullName": "Nguyen Van A",
    "email": "a@example.com",
    "studentId": "22040001",
    "className": "K56A",
    "avatarUrl": null,
    "unit": {
      "id": "unit_1",
      "name": "Khoa Ngôn ngữ & Văn hóa Anh"
    }
  }
}
```

### 7.2 Update My Profile

`PATCH /api/profile`

Request:

```json
{
  "fullName": "Nguyen Van A",
  "className": "K56A",
  "avatarUrl": "https://example.com/avatar.png"
}
```

## 8. Evidence APIs

### 8.1 Get My Evidences

`GET /api/evidences`

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "ev_1",
      "title": "Chứng nhận tham gia",
      "criterion": "TINH_NGUYEN",
      "reviewLevel": "TRUONG",
      "fileUrl": "https://example.com/file.pdf",
      "fileType": "pdf",
      "status": "PENDING",
      "createdAt": "2026-05-11T00:00:00.000Z"
    }
  ]
}
```

### 8.2 Create Evidence

`POST /api/evidences`

Request:

```json
{
  "activityId": "act_1",
  "title": "Giấy chứng nhận tham gia",
  "criterion": "DAO_DUC",
  "reviewLevel": "TRUONG",
  "description": "Minh chứng tham gia hoạt động",
  "fileUrl": "https://example.com/uploaded.pdf",
  "fileName": "uploaded.pdf",
  "fileType": "pdf",
  "fileSize": 123456
}
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "ev_1",
    "status": "PENDING"
  }
}
```

### 8.3 Delete Evidence

`DELETE /api/evidences/:id`

Rules:

- only owner can delete
- approved evidence cannot be deleted in MVP unless policy changes

## 9. Progress APIs

### 9.1 Get My Progress

`GET /api/progress`

Response:

```json
{
  "success": true,
  "data": {
    "summary": {
      "completedCriteriaCount": 2,
      "totalCriteriaCount": 5
    },
    "matrix": [
      {
        "criterion": "DAO_DUC",
        "reviewLevel": "TRUONG",
        "isCompleted": true
      },
      {
        "criterion": "HOC_TAP",
        "reviewLevel": "TRUONG",
        "isCompleted": false
      }
    ]
  }
}
```

## 10. Leaderboard APIs

### 10.1 Get Leaderboard

`GET /api/leaderboard`

Response:

```json
{
  "success": true,
  "data": [
    {
      "rank": 1,
      "userId": "user_1",
      "fullName": "Nguyen Van A",
      "unitName": "Khoa Ngôn ngữ & Văn hóa Anh",
      "approvedActivityCount": 8
    }
  ]
}
```

## 11. Admin APIs

### 11.1 Create Activity

`POST /api/admin/activities`

### 11.2 Update Activity

`PATCH /api/admin/activities/:id`

### 11.3 Delete Activity

`DELETE /api/admin/activities/:id`

### 11.4 Get Evidences for Review

`GET /api/admin/evidences?status=PENDING&page=1&pageSize=20`

### 11.5 Review Evidence

`PATCH /api/admin/evidences/:id/review`

Request:

```json
{
  "status": "APPROVED",
  "rejectionReason": null
}
```

Or reject:

```json
{
  "status": "REJECTED",
  "rejectionReason": "File không rõ nội dung minh chứng"
}
```

### 11.6 Manage Notifications

- `GET /api/admin/notifications`
- `POST /api/admin/notifications`
- `PATCH /api/admin/notifications/:id`
- `DELETE /api/admin/notifications/:id`

### 11.7 Manage Criteria Docs

- `GET /api/admin/criteria-docs`
- `POST /api/admin/criteria-docs`
- `PATCH /api/admin/criteria-docs/:id`
- `DELETE /api/admin/criteria-docs/:id`

## 12. Acceptance Notes

- all list endpoints should support empty results
- protected endpoints must return unauthorized if not logged in
- admin endpoints must return forbidden if role is not admin
- validation errors should return field-safe messages usable by forms
````
