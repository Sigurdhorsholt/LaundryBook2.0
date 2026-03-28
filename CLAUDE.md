# CLAUDE.md — LaundryBook 2.0

Project rules for Claude. Read this before touching any file.

---

## Project overview

Modular SaaS platform for apartment building management.
Tech: React + TypeScript + Vite + Redux Toolkit + RTK Query / .NET Web API + MediatR + EF Core.
See `PLAN.md` for the full architecture and domain model.

---

## General rules

- Only change what was asked. No drive-by refactors, no added features, no speculative abstractions.
- Do not add comments explaining what code does. Only comment why something non-obvious is done.
- Do not add docstrings, JSDoc, or XML docs unless asked.
- Do not add error handling for things that cannot happen. Validate at system boundaries only.
- Prefer editing an existing file over creating a new one.
- Never create README or documentation files unless explicitly requested.

---

## Frontend rules

### Component size

- A component file should not exceed ~150 lines of JSX/TSX as a general rule.
- If a component is growing large, split it: extract sub-components into their own files in the same folder.
- A page component (in `pages/`) should only contain layout and composition — it orchestrates sub-components and data hooks. It should not contain rendering logic for individual UI sections inline.

**Bad:** A 600-line page file that renders a collapsible card, a week navigator, a slot grid, and a modal all inline.
**Good:** `LaundryPage.tsx` composes `<UpcomingBookingsCard>`, `<WeekNavigator>`, `<BookingGrid>`, `<ConfirmModal>` — each in its own file.

### Types

- Types and interfaces live in a `types.ts` file co-located with the feature or component that owns them.
- Do not define types inside component files unless they are local props interfaces with no other consumers.
- Do not define types at the top of a page — move them to `types.ts`.
- DTOs returned from the API are defined once in the feature's `*Api.ts` file. Do not duplicate or redefine them elsewhere.

**Example structure:**
```
features/laundry/
  laundryApi.ts      ← API slice + exported DTOs
  types.ts           ← PendingAction, GridBooking, and other local types
  BookingGrid.tsx
  ConfirmModal.tsx
  UpcomingBookingsCard.tsx
```

### Constants

- Feature-specific constants (day names, month names, dot colors, label maps) go in a `constants.ts` file in the feature folder.
- Do not define constants at the top of a component or page file.
- Shared/cross-feature constants belong in `shared/constants.ts`.

### Styling — always use theme tokens

- **Never hardcode hex color values in JSX.** Always import from `shared/theme.ts`.
- `colors.primary`, `colors.textSecondary`, `colors.borderDefault`, etc. are the only source of truth for colors.
- If a color you need does not exist in `theme.ts`, add it there — do not inline it.

**Bad:**
```tsx
<p style={{ color: '#5a6a7a' }}>...</p>
<div style={{ backgroundColor: '#1565c0' }}>...</div>
```
**Good:**
```tsx
<p style={{ color: colors.textSecondary }}>...</p>
<div style={{ backgroundColor: colors.primary }}>...</div>
```

### Shared UI components

- Before creating any layout element, check `shared/ui/` first.
- `PageHeader` handles page titles, descriptions, and eyebrow labels. Use it — do not roll a custom `<h1>` + `<p>` header inline in a page.
- `EmptyState` handles empty/placeholder states. Use it.
- If you need a primitive that doesn't exist yet, add it to `shared/ui/` — not inline in the feature.

### Utility functions

- Date helpers (`addDays`, `todayStr`, `formatTimeRange`, `formatDateFull`, etc.) belong in `shared/utils/dateUtils.ts`.
- Do not define the same utility function in multiple files. If it exists somewhere, import it.
- Formatting helpers belong in `shared/utils/formatUtils.ts`.
- A utility function that is only used by one feature can live in that feature's folder as `utils.ts`.

### RTK Query / API slices

- One API slice file per feature: `features/laundry/laundryApi.ts`, `features/auth/authApi.ts`, etc.
- All tag types and cache invalidation logic live in the slice file.
- Do not spread API hooks across multiple files.
- Exported DTOs from an API slice are the canonical type definition for that data shape.

### File placement

```
pages/            ← Route-level components. Thin: compose features, run top-level queries.
features/<name>/  ← Everything for one feature module: API slice, sub-components, types, constants, utils.
shared/ui/        ← Reusable, feature-agnostic UI primitives.
shared/utils/     ← Utility functions with no feature affiliation.
shared/theme.ts   ← All color tokens. Single source of truth.
shared/constants.ts ← Cross-feature constants only.
```

---

## Backend rules (.NET)

### Layer boundaries

- **Domain** — entities, enums, value objects, domain interfaces. Zero dependencies on Application or Infrastructure.
- **Application** — MediatR commands/queries, DTOs, validators. No EF Core, no HTTP types.
- **Infrastructure** — EF Core DbContext, repositories, migrations, auth services. References Domain.
- **WebApi** — controllers, middleware, DI composition. References Application. Controllers must not contain business logic.

### Controllers

- Controllers are thin: validate the request, send to MediatR, return the result. Nothing else.
- All business logic goes in Application handlers.
- Do not put validation logic, domain decisions, or DB access in controllers.

### MediatR handlers

- One command or query per file.
- Folder structure mirrors the feature: `Application/Laundry/Commands/CreateBooking/`.
- Handlers return DTOs, not domain entities.

### EF Core

- Migrations are always forward-only. Never modify a previous migration.
- The DbContext lives in Infrastructure. No EF references in Application or Domain.

### Naming

- Commands: `CreateBookingCommand`, `CancelBookingCommand`
- Queries: `GetLaundryRoomsQuery`, `GetBookingsQuery`
- Handlers: `CreateBookingCommandHandler`
- DTOs: `BookingDto`, `LaundryRoomDto` (no "Response" or "Result" suffix)
