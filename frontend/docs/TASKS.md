# TASKS.md

# Development Tasks

## Dự án: Bản đồ 5 Tốt

## 1. Task Planning Principles

- [x] build by vertical slices
- [x] prioritize MVP
- [x] each task should have clear completion criteria
- [x] do not start advanced animation before core flows work

## 2. Phase 0 - Project Bootstrap

### Task 0.1

Setup project with:

- [x] Next.js App Router
- [x] TypeScript
- [x] Tailwind CSS
- [x] shadcn/ui
- [x] TanStack Query
- [x] GSAP
- [x] React Hook Form
- [x] Zod

Done when:

- [x] app runs locally
- [x] lint/typecheck pass
- [x] base folder structure exists

### Task 0.2

Create global theme foundation:

- [x] color tokens
- [x] spacing rhythm
- [x] typography mapping
- [x] reusable glass card styles

Done when:

- [x] basic design tokens are available globally
- [x] demo page shows token usage

## 3. Phase 1 - App Shell & Layout

### Task 1.1

Build public app shell:

- [x] navbar
- [x] footer
- [x] page container
- [x] responsive structure

### Task 1.2

Build shared UI primitives:

- [x] GlassCard
- [x] GradientShellCard
- [x] SectionHeader
- [x] EmptyState
- [x] ErrorState
- [x] LoadingSkeleton

Done when:

- [x] components are reusable across pages

## 4. Phase 2 - Authentication

### Task 2.1

Build register page
Fields:

- [x] full name
- [x] email
- [x] student ID
- [x] class name
- [x] unit
- [x] password
- [x] confirm password

### Task 2.2

Build login page

### Task 2.3

Add auth guard behavior for protected pages

Done when:

- [x] register/login forms validate correctly
- [x] protected routes redirect unauthenticated users

## 5. Phase 3 - Public Content

### Task 3.1

Build home page:

- [x] hero
- [x] CTA
- [x] stats
- [x] leaderboard preview

### Task 3.2

Build criteria page:

- [x] grouped PDF docs
- [x] preview/download links

### Task 3.3

Build activities page:

- [x] search
- [x] criterion filter
- [x] activity grid
- [x] loading/empty/error states

### Task 3.4

Build activity detail page:

- [x] full metadata
- [x] participate button
- [x] submit evidence button

Done when:

- [x] user can navigate public pages smoothly

## 6. Phase 4 - Profile & Evidence

### Task 4.1

Build profile page:

- [x] personal info
- [x] summary card
- [x] activity history placeholder
- [x] evidence vault preview

### Task 4.2

Build evidences page:

- [x] evidence list
- [x] file cards
- [x] delete action
- [x] status badges

### Task 4.3

Build submit evidence flow:

- [x] open dialog or page
- [x] form validation
- [x] mutation handling
- [x] success/error feedback

### Task 4.4

Build progress page:

- [x] progress summary
- [x] matrix display
- [x] basic recommendation UI placeholder

Done when:

- [x] user can manage own evidences and see progress

## 7. Phase 5 - Notifications

### Task 5.1

Build notifications page:

- [x] list view
- [x] read/unread state
- [x] countdown badge UI
- [x] suggestion cards
- [x] integrate backend notifications API
- [x] mark one/all notifications as read

Done when:

- [x] notifications display correctly with states
- [x] notifications load from backend

## 8. Phase 6 - Admin Dashboard

### Task 6.1

Build admin shell and sidebar

### Task 6.2

Build admin activities table:

- [x] list
- [x] create
- [x] edit
- [x] delete

### Task 6.3

Build admin evidence review page:

- [x] list pending evidences
- [x] review panel
- [x] approve/reject action

### Task 6.4

Build admin criteria docs management

### Task 6.5

Build admin notifications management

Done when:

- [x] admin can manage core content and review evidences

## 9. Phase 7 - Polish & Motion

### Task 7.1

Add GSAP reveal animations to:

- [x] home hero
- [x] stats cards
- [x] activity cards
- [x] section transitions

### Task 7.2

Refine responsive behavior

### Task 7.3

Improve loading/empty/error UX

### Task 7.4

Optional:

- [x] add subtle background visual
- [x] only if performance remains good

Done when:

- [x] app feels polished without harming usability

## 10. Phase 8 - QA & Hardening

### Task 8.1

- [ ] Cross-browser checks

### Task 8.2

- [ ] Accessibility pass

### Task 8.3

- [ ] Type safety review

### Task 8.4

- [ ] Performance review

### Task 8.5

- [ ] Final UI consistency review

## 11. Priorities

### P0

- [x] bootstrap
- [x] theme
- [x] auth
- [x] home
- [x] activities
- [x] activity detail
- [x] profile
- [x] evidence upload
- [x] progress matrix
- [x] admin evidence review

### P1

- [x] leaderboard refinement
- [x] notifications
- [x] criteria docs management
- [x] admin activity CRUD polish

### P2

- [x] advanced recommendation logic
- [x] richer analytics
- [x] WebGL background enhancement

## 12. Definition of Done

A task is done when:

- [x] UI implemented according to design system
- [x] responsive states covered
- [x] loading/empty/error states handled
- [x] types are defined
- [x] API integration uses TanStack Query
- [x] form validation exists where needed
- [x] no TypeScript errors
- [x] no obvious console errors
