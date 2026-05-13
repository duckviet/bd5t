# AGENT_RULES.md

# Agent Working Rules

## Dự án: Bản đồ 5 Tốt

## 1. Objective

These rules define how AI agents should contribute to the project consistently, safely, and within scope.

## 2. Stack Rules

Frontend must use:

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- TanStack Query
- GSAP
- React Hook Form
- Zod

Do not replace these with alternative libraries unless explicitly instructed.

## 3. Scope Rules

Do:

- implement only features documented in SRS and task list
- prioritize MVP
- build reusable components
- follow design system

Do not:

- add major new features without request
- invent backend business logic beyond documented rules
- add unnecessary dependencies
- over-engineer animation or architecture

## 4. Design Rules

Must follow provided system design:

- purple/rose accent palette
- glassy modular surfaces
- 4px rhythm
- rounded card language
- restrained shadows
- minimal motion

Do not:

- introduce unrelated visual styles
- use harsh shadows or neon colors
- add loud animations
- break component consistency

## 5. Code Organization Rules

- organize by feature/domain
- keep shared components in shared folders
- keep types explicit
- keep utilities small and purposeful
- avoid monolithic files

## 6. Component Rules

Each component should:

- have a single clear purpose
- accept typed props
- support loading/empty/error variants when relevant
- avoid hardcoded mock data inside reusable components

When needed, create:

- container/presentation separation
- wrapper components around shadcn primitives

## 7. Data Rules

- use TanStack Query for all server state
- use stable query keys
- do not fetch the same resource in multiple incompatible ways
- define API response types
- handle loading, empty, error states

## 8. Form Rules

All forms should:

- use React Hook Form
- use Zod schemas
- show inline validation messages
- disable submit while pending
- show success/error feedback

## 9. Styling Rules

- use Tailwind utilities primarily
- extract repeated class patterns when justified
- respect spacing scale
- use semantic color tokens
- ensure mobile responsiveness

Avoid:

- arbitrary spacing everywhere
- random one-off color values
- inconsistent radius/shadow usage

## 10. Animation Rules

Use GSAP only for:

- entrance transitions
- section reveals
- subtle UI emphasis

Avoid:

- excessive loop animations
- long blocking animations
- animation that interferes with usability

Respect reduced motion preferences where possible.

## 11. Accessibility Rules

- all interactive elements must be keyboard accessible
- icon-only buttons need accessible labels
- headings must be structured
- focus state must remain visible
- forms must have labels and errors

## 12. Quality Rules

Before considering a task complete:

- TypeScript passes
- no obvious lint issues
- no console errors
- loading/empty/error states exist
- responsive behavior is acceptable
- components match design system

## 13. Decision Rules

If a requirement is ambiguous:

1. prefer simplest MVP-compatible solution
2. do not invent complex business logic
3. align with existing design and architecture docs
4. leave a clear note for human review if necessary

## 14. File Creation Rules

When creating new files:

- use descriptive names
- colocate by feature
- keep exports clean
- avoid duplicate utility functions across features

## 15. Dependency Rules

Before adding a dependency:

- check if existing stack already solves the problem
- prefer built-in Next.js/React/Tailwind/shadcn capability
- avoid library sprawl

## 16. Communication Rules

When reporting work:

- state what was added
- list affected files
- mention assumptions
- mention follow-up tasks or gaps

## 17. Forbidden Behaviors

Do not:

- rewrite unrelated modules unnecessarily
- silently change route structure
- silently change type contracts
- hardcode fake auth logic into production paths without marking it
- ignore error states
- ignore mobile layout

## 18. Preferred Workflow

For each feature:

1. read SRS and task definition
2. check related docs
3. define types
4. create UI skeleton
5. connect data with TanStack Query
6. add validation and state handling
7. polish with minimal motion
8. verify responsive and error states

## 19. Final Principle

Clarity, consistency, and MVP-first execution are more important than cleverness.
