# DATABASE_SCHEMA.md

# Database Schema

## Dự án: Bản đồ 5 Tốt

## 1. Overview

Schema này định nghĩa các thực thể chính phục vụ MVP:

- User
- Unit
- Activity
- CriterionDocument
- Evidence
- Notification
- ProgressRecord
- LeaderboardSnapshot (optional)
- AdminActionLog (optional)

## 2. Enums

### UserRole

- `STUDENT`
- `ADMIN`

### CriterionType

- `DAO_DUC`
- `HOC_TAP`
- `THE_LUC`
- `TINH_NGUYEN`
- `HOI_NHAP`

### ReviewLevel

- `TRUONG`
- `DHQGHN`
- `THANH_PHO`
- `TRUNG_UONG`

### EvidenceStatus

- `PENDING`
- `APPROVED`
- `REJECTED`

### NotificationType

- `SYSTEM`
- `ACTIVITY_NEW`
- `DEADLINE`
- `SUGGESTION`

## 3. Entities

## 3.1. Unit

Represents khoa / đơn vị.

Fields:

- `id: string`
- `name: string`
- `code: string`
- `createdAt: datetime`
- `updatedAt: datetime`

Constraints:

- `code` unique
- `name` required

## 3.2. User

Fields:

- `id: string`
- `fullName: string`
- `email: string`
- `studentId: string`
- `className: string`
- `passwordHash: string`
- `avatarUrl: string | null`
- `role: UserRole`
- `unitId: string`
- `createdAt: datetime`
- `updatedAt: datetime`

Constraints:

- `email` unique
- `studentId` unique
- `unitId` references `Unit.id`

Notes:

- admin account may not require student-oriented display fields in UI, but schema can still keep them nullable if needed
- for MVP, `className` required for students

## 3.3. RefreshToken

Lưu trữ token để cấp lại access token.

Fields:

- `id: string`
- `userId: string`
- `tokenHash: string`
- `expiresAt: datetime`
- `revokedAt: datetime | null`
- `createdAt: datetime`

Constraints:

- `userId` references `User.id`
- `tokenHash` unique

## 3.4. Activity

Fields:

- `id: string`
- `title: string`
- `slug: string`
- `thumbnailUrl: string | null`
- `shortDescription: string | null`
- `description: text`
- `rules: text | null`
- `rewards: text | null`
- `organizer: string`
- `contactInfo: string | null`
- `registrationUrl: string`
- `startAt: datetime | null`
- `endAt: datetime | null`
- `reviewLevel: ReviewLevel | null`
- `isPublished: boolean`
- `createdById: string`
- `createdAt: datetime`
- `updatedAt: datetime`

Constraints:

- `slug` unique
- `registrationUrl` required
- `createdById` references `User.id`

## 3.5. ActivityCriterion

Join table để một hoạt động có thể thuộc nhiều tiêu chí.

Fields:

- `id: string`
- `activityId: string`
- `criterion: CriterionType`

Constraints:

- unique composite: `(activityId, criterion)`

## 3.6. CriterionDocument

Fields:

- `id: string`
- `title: string`
- `description: string | null`
- `reviewLevel: ReviewLevel`
- `fileUrl: string`
- `publishedAt: datetime | null`
- `createdById: string`
- `createdAt: datetime`
- `updatedAt: datetime`

Constraints:

- `fileUrl` required
- `createdById` references `User.id`

## 3.7. Evidence

Fields:

- `id: string`
- `userId: string`
- `activityId: string | null`
- `criterion: CriterionType`
- `reviewLevel: ReviewLevel | null`
- `title: string`
- `description: string | null`
- `fileUrl: string`
- `fileName: string`
- `fileType: string`
- `fileSize: number`
- `status: EvidenceStatus`
- `reviewedById: string | null`
- `reviewedAt: datetime | null`
- `rejectionReason: string | null`
- `createdAt: datetime`
- `updatedAt: datetime`

Constraints:

- `userId` references `User.id`
- `activityId` references `Activity.id`
- `reviewedById` references `User.id`
- `fileUrl` required
- `status` default `PENDING`

Notes:

- evidence may be uploaded independently of an activity, but still mapped to a criterion
- only approved evidence counts toward progress

## 3.8. Notification

Fields:

- `id: string`
- `title: string`
- `message: string`
- `type: NotificationType`
- `userId: string | null`
- `activityId: string | null`
- `isRead: boolean`
- `expiresAt: datetime | null`
- `createdAt: datetime`

Constraints:

- `userId` null means system/global notification
- `activityId` optional relation to activity

## 3.9. ProgressRecord

Stores derived or cached progress state.

Fields:

- `id: string`
- `userId: string`
- `criterion: CriterionType`
- `reviewLevel: ReviewLevel`
- `isCompleted: boolean`
- `completedAt: datetime | null`
- `sourceEvidenceCount: number`
- `updatedAt: datetime`

Constraints:

- unique composite: `(userId, criterion, reviewLevel)`

Notes:

- can be computed dynamically or stored as cached materialized data

## 3.10. AdminActionLog (Optional)

Fields:

- `id: string`
- `adminId: string`
- `action: string`
- `targetType: string`
- `targetId: string`
- `metadataJson: json | null`
- `createdAt: datetime`

## 4. Relationships Summary

- One `Unit` has many `User`
- One `User` can create many `Activity`
- One `Activity` has many `ActivityCriterion`
- One `Activity` has many `Evidence`
- One `User` has many `Evidence`
- One `User` has many `Notification`
- One `User` has many `ProgressRecord`
- One `Activity` may have many related `Notification`

## 5. Suggested Validation Rules

### User

- email must be valid
- studentId required and unique
- password minimum 8 chars

### Activity

- title required
- slug required and unique
- at least one criterion required
- registrationUrl must be valid URL

### Evidence

- file type allowed: pdf, jpg, jpeg, png
- file size max: 10MB
- title required
- criterion required

## 6. Suggested Prisma-style Model Notes

If using Prisma later, implement:

- enum types
- composite unique keys
- relation indexes
- createdAt/updatedAt defaults
- slug indexing for activity detail page

## 7. Progress Logic Reference

A progress cell is considered complete when:

- there exists sufficient approved evidence
- evidence satisfies configured review level and criterion requirements

For MVP simplified logic:

- at least 1 approved evidence for a criterion + level can mark that cell as completed
- advanced counting logic can be added later
