# Admin Evidences Improvement Plan

## Summary

Improve the admin evidence review page with backend-backed filtering, sorting,
pagination, quick statistics, inline file preview, bulk review, and lightweight
polling for new pending submissions.

This project follows an OpenAPI-first workflow. Do not hand-edit generated
backend DTO/interface files or generated frontend API files. Contract changes
must start in `backend/openapi`, then regenerate backend and frontend code.

## OpenAPI Contract Changes

Update `backend/openapi` first:

- Extend `GET /admin/evidences` with query params:
  - `search`
  - `status`
  - `criteria`
  - `submittedFrom`
  - `submittedTo`
  - `unitId`
  - `className`
  - `sort`
  - `page`
  - `pageSize`
- Add `GET /admin/evidences/stats`.
- Add `PATCH /admin/evidences/review-bulk`.
- Extend `EvidenceItem` for admin review context:
  - `userAvatarUrl`
  - `userUnitId`
  - `userUnitName`
  - `userClassName`
- Add schemas:
  - `AdminEvidenceStats`
  - `BulkReviewEvidenceRequest`

After editing OpenAPI, regenerate:

- Backend server/types from `backend/openapi`.
- Frontend Orval client/types from the regenerated OpenAPI output.

## Backend Implementation

- Keep single review as the source of truth for progress recalculation and
  notification creation.
- Implement handlers/services/repositories against generated DTO/interface
  shapes only after generation.
- Extend repository filtering and stats queries in non-generated repository
  implementation files.

## Frontend Changes

- Split the admin evidence page into smaller local components inside
  `frontend/app/admin/evidences/page.tsx` for now.
- Add:
  - dashboard stat cards
  - status, criteria, date, class/unit, and sort controls
  - server-side pagination
  - selected item highlight with stronger background
  - student avatar/fallback initials
  - sticky detail panel
  - inline image/PDF preview
  - bulk selection and bulk approve/reject with shared note
- Use polling every 30 seconds while the page is open to surface newly pending
  evidence without adding WebSocket/SSE infrastructure.
- Use generated frontend hooks/types only; do not add manual API helpers unless
  the generator cannot express the contract.

## Acceptance Criteria

- Filters and sort are reflected in API params and work beyond the first page.
- Pagination uses API `meta` instead of slicing client-side results.
- Single and bulk review invalidate evidence list, stats, and notifications.
- File preview works inline for images and PDFs; unsupported files still open in
  a new tab.
- No regression to existing single approve/reject behavior.
- Generated files should only change through the documented generator commands.
