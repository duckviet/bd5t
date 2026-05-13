# ARCHITECTURE.md

# Frontend Architecture

## Dự án: Bản đồ 5 Tốt

## 1. Tech Stack

### Core

- Next.js (App Router)
- React
- TypeScript

### UI

- Tailwind CSS
- shadcn/ui
- Lucide icons hoặc Solar-compatible linear icons

### Data

- TanStack Query

### Animation

- GSAP
- GSAP ScrollTrigger

### Forms & Validation

- React Hook Form
- Zod

## 2. Architectural Principles

- ưu tiên modular theo feature/domain
- tách UI components và business/data logic
- server state dùng TanStack Query
- client state cục bộ dùng React state
- route-based code organization
- typed data flow end-to-end
- reusability > page-specific hardcode

## 3. App Router Structure

```text
src/
  app/
    (public)/
      page.tsx
      criteria/
        page.tsx
      activities/
        page.tsx
        [slug]/
          page.tsx
      notifications/
        page.tsx
    (auth)/
      login/
        page.tsx
      register/
        page.tsx
    (dashboard)/
      profile/
        page.tsx
      evidences/
        page.tsx
      my-progress/
        page.tsx
    admin/
      page.tsx
      activities/
        page.tsx
      evidences/
        page.tsx
      notifications/
        page.tsx
      criteria/
        page.tsx
      users/
        page.tsx
```

````

## 4. Feature-based Structure

```text
src/
  features/
    auth/
      api/
      components/
      hooks/
      schemas/
      types.ts
    activities/
      api/
      components/
      hooks/
      schemas/
      types.ts
    criteria/
      api/
      components/
      hooks/
      types.ts
    notifications/
      api/
      components/
      hooks/
      types.ts
    profile/
      api/
      components/
      hooks/
      schemas/
      types.ts
    evidences/
      api/
      components/
      hooks/
      schemas/
      types.ts
    progress/
      api/
      components/
      hooks/
      types.ts
    admin/
      api/
      components/
      hooks/
      schemas/
      types.ts
```

## 5. Shared Layers

```text
src/
  components/
    common/
    layout/
    motion/
    ui/
  lib/
    api/
    auth/
    constants/
    utils/
    validations/
    animations/
  hooks/
  types/
```

## 6. Rendering Strategy

### Server Components

Use for:

- static or semi-static pages
- page shell/layout
- initial SEO-friendly content
- fetching low-interactivity content when appropriate

### Client Components

Use for:

- forms
- filter/search interactions
- upload flow
- dashboards with user interactions
- GSAP animations
- TanStack Query consumers

## 7. State Management Strategy

### Server State

Managed by TanStack Query:

- current user profile
- activities list/detail
- criteria docs
- notifications
- evidences
- leaderboard
- admin tables
- progress matrix

### Client State

Managed locally:

- modal open/close
- selected filter
- active tab
- file preview state
- form temporary state

## 8. Query Key Convention

- `["auth", "me"]`
- `["activities", filters]`
- `["activity", slug]`
- `["criteria-docs"]`
- `["notifications", userId]`
- `["profile", userId]`
- `["evidences", userId]`
- `["progress", userId]`
- `["leaderboard"]`
- `["admin", "activities", params]`
- `["admin", "evidences", params]`

## 9. UI Design Integration

App must follow the provided design system:

- glass-like modular cards
- purple/rose accent palette
- 4px spacing rhythm
- rounded surfaces
- restrained shadow
- minimal motion
- full-bleed dashboard composition

## 10. Core Reusable Components

- `AppShell`
- `Navbar`
- `Footer`
- `GlassCard`
- `GradientShellCard`
- `SectionHeader`
- `ActivityCard`
- `NotificationCard`
- `EvidenceFileCard`
- `ProgressMatrix`
- `StatsCard`
- `LeaderboardTable`
- `EmptyState`
- `ErrorState`
- `LoadingSkeleton`

## 11. Motion Rules

GSAP only where it improves clarity:

- hero fade/reveal
- section reveal
- card stagger
- dashboard panel entrance
- subtle hover transitions

Avoid:

- over-animation
- heavy transform chains
- distracting looping motion

## 12. Accessibility Rules

- proper heading hierarchy
- keyboard navigability
- visible focus states
- semantic buttons/links
- aria labels for icon-only actions
- reduced motion fallback

## 13. Performance Rules

- optimize image loading with `next/image`
- lazy load heavy sections if needed
- minimize client bundle size
- cleanup GSAP instances
- optional WebGL only if non-blocking
- keep animations lightweight on mobile

## 14. Error Handling Strategy

Every page with async data should support:

- loading state
- empty state
- error state
- retry action when applicable

## 15. Authentication Strategy

Frontend must support:

- register
- login
- logout
- route protection for profile/admin pages
- role-aware UI rendering

Auth implementation detail can be adapted later, but app structure must support:

- student role
- admin role
````
