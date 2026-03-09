# Apartment Management Platform — Project Plan

## Product Vision

A modular SaaS platform for apartment buildings ("opgange") that replaces analog processes with simple digital tools.

**Target customers:** Small ejerforeninger, andelsforeninger, small private rental buildings, building sections inside larger complexes.
**Typical size:** 6–80 apartments, volunteer board, minimal technical expertise.
**Core principle:** Each building is a workspace with optional modules.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Vite, Redux Toolkit, RTK Query |
| Backend | .NET Web API, C#, MediatR, EF Core |
| Auth | JWT via httpOnly cookies |
| DB (dev) | SQLite (EF Core migrations — production-ready SQL from day 1) |
| DB (prod) | TBD — PostgreSQL or SQL Server |

---

## Solution Structure

```
LaundryBook2.0.sln
├── src/
│   ├── WebApi/               # Controllers, middleware, DI composition root
│   ├── Application/          # MediatR commands, queries, DTOs, validators
│   ├── Domain/               # Entities, value objects, domain enums, interfaces
│   └── Infrastructure/       # EF Core, repositories, migrations, auth services
└── frontend/
    └── src/
        ├── app/              # Redux store, RTK Query base API
        ├── features/         # One folder per module (laundry, residents, …)
        ├── shared/           # Shared components, hooks, types
        └── pages/            # Route-level page components
```

---

## Role Hierarchy

| Role | Scope | Description |
|---|---|---|
| `SysAdmin` | Platform-wide | Full access to all complexes, platform settings |
| `OrgAdmin` | 1..* complexes | Manages multiple complexes (e.g. property management company) |
| `ComplexAdmin` | 1 complex | Local admin for one complex |
| `Resident` | 1 complex | End user, no admin rights |

- A `Resident` belongs to exactly **one** complex (MVP).
- An `OrgAdmin` can belong to **many** complexes.
- A `SysAdmin` implicitly has access to all.

---

## Module Roadmap

| # | Module | Status |
|---|---|---|
| 1 | **Laundry Booking** | 🔨 In progress |
| 2 | Resource Booking (shared spaces) | Planned |
| 3 | Residents Directory | Planned |
| 4 | Announcements / Notice Board | Planned |
| 5 | Issue Reporting / Maintenance | Planned |
| 6 | Document Storage | Planned |

---

## Module 1 — Laundry Booking

### Concept

Admins configure laundry rooms with machines and timeslot templates.
Residents book available slots. Each complex has its own settings controlling booking behaviour.

### Booking Modes (per complex)

| Mode | Description |
|---|---|
| `BookEntireRoom` | User books a timeslot for the whole laundry room. No machine selection. |
| `BookSpecificMachine` | User books a timeslot for a specific machine within the room. |

### Domain Model

```
Property (Complex)
 └── ComplexSettings         (booking mode, cancellation window, max active bookings per user)
 └── LaundryRoom             (name, description)
      └── LaundryMachine     (name, type — only relevant in BookSpecificMachine mode)
      └── TimeSlotTemplate   (startTime, endTime — recurring daily, indefinite)
           └── Booking       (userId, date, timeSlotTemplateId, laundryRoomId, machineId?)
```

**Key design decision:**
`TimeSlotTemplate` is stored **once per LaundryRoom** (not per day). A `Booking` references the template + a concrete date. This avoids redundant slot rows.

### Entities (Domain layer)

```
Property
  Id, Name, Address

ComplexSettings
  PropertyId
  BookingMode           (enum: BookEntireRoom | BookSpecificMachine)
  CancellationWindowMinutes   (int — min notice required to cancel)
  MaxConcurrentBookingsPerUser (int)

LaundryRoom
  Id, PropertyId, Name, Description, IsActive

LaundryMachine
  Id, LaundryRoomId, Name, MachineType (enum: Washer | Dryer | WasherDryer), IsActive

TimeSlotTemplate
  Id, LaundryRoomId, StartTime (TimeOnly), EndTime (TimeOnly), IsActive

Booking
  Id, UserId, LaundryRoomId, TimeSlotTemplateId
  MachineId (nullable — null when mode is BookEntireRoom)
  Date (DateOnly)
  CreatedAt, CancelledAt (nullable)
  Status (enum: Active | CancelledByUser | CancelledByAdmin)

UserComplexMembership
  UserId, PropertyId, Role (enum)
  ApartmentNumber (string, nullable)
```

---

## Phase Plan

### Phase 0 — Solution Scaffold
- [ ] Create .NET solution with 4 projects: `WebApi`, `Application`, `Domain`, `Infrastructure`
- [ ] Add project references (`WebApi` → `Application` → `Domain`, `Infrastructure` → `Domain`)
- [ ] Configure EF Core with SQLite in `Infrastructure`, register in `WebApi`
- [ ] Add MediatR to `Application`, register in `WebApi`
- [ ] Add global error handling middleware
- [ ] Scaffold React + Vite + TypeScript frontend in `/frontend`
- [ ] Set up Redux Toolkit store + RTK Query base API
- [ ] Configure CORS between frontend (Vite dev server) and WebApi
- [ ] Add `.gitignore` entries for frontend (`node_modules`, `dist`)

### Phase 1 — Identity & Auth
- [ ] `User` entity: Id, Email, PasswordHash, FirstName, LastName, CreatedAt
- [ ] `UserComplexMembership` entity with role enum
- [ ] Register endpoint (`POST /auth/register`)
- [ ] Login endpoint (`POST /auth/login`) — issues JWT via httpOnly cookie
- [ ] Logout endpoint (`POST /auth/logout`) — clears cookie
- [ ] `GET /auth/me` — returns current user profile
- [ ] Role-based authorization middleware/policy setup
- [ ] Frontend: login page, auth slice in Redux, protected routes

### Phase 2 — Property & Complex Management
- [ ] `Property` entity + CRUD for SysAdmin
- [ ] `ComplexSettings` entity with defaults
- [ ] `POST /properties` — SysAdmin creates a complex
- [ ] `GET /properties/{id}` — scoped by membership
- [ ] Invite/add resident to complex (`POST /properties/{id}/members`)
- [ ] `ComplexSettings` update endpoint (ComplexAdmin+)
- [ ] Frontend: admin panel shell, complex settings page

### Phase 3 — Laundry Room & Machine Setup (Admin)
- [ ] `LaundryRoom` CRUD endpoints (scoped to complex)
- [ ] `LaundryMachine` CRUD endpoints (scoped to room)
- [ ] `TimeSlotTemplate` CRUD endpoints (scoped to room)
- [ ] Validation: no overlapping timeslots per room
- [ ] Soft-delete (IsActive flag) for rooms, machines, slots
- [ ] Frontend: admin laundry setup page (rooms → machines → timeslots)

### Phase 4 — Booking (Resident)
- [ ] `GET /laundry/rooms/{roomId}/availability?date=` — returns timeslots with availability per date
- [ ] `POST /bookings` — create booking (enforce ComplexSettings rules)
  - Check: max concurrent bookings per user not exceeded
  - Check: slot + machine not already taken on that date
  - Check: booking mode (room vs machine)
- [ ] `DELETE /bookings/{id}` — cancel booking (enforce cancellation window)
- [ ] `GET /bookings/my` — list user's upcoming bookings
- [ ] `GET /bookings/admin?roomId=&date=` — admin view of all bookings
- [ ] Frontend: booking calendar view, my bookings list, cancel button

### Phase 5 — Admin Booking Management
- [ ] Admin cancel any booking (`DELETE /admin/bookings/{id}`)
- [ ] Admin view full booking history per room
- [ ] Frontend: admin booking overview page

---

## Key Design Decisions Log

| # | Decision | Rationale |
|---|---|---|
| 1 | `TimeSlotTemplate` stored once per room, not per day | Avoids thousands of redundant rows; bookings reference template + date |
| 2 | Booking mode per complex (`BookEntireRoom` vs `BookSpecificMachine`) | Different complexes have different setups; keeps schema flexible |
| 3 | `MachineId` nullable on `Booking` | Supports both booking modes without two separate booking tables |
| 4 | Cancellation window as minutes in `ComplexSettings` | Fully configurable by admin without code changes |
| 5 | JWT in httpOnly cookie | Prevents XSS token theft; standard for browser-based apps |
| 6 | SQLite for dev, EF migrations from day 1 | Easy local dev; migrations ensure clean upgrade path to PostgreSQL/SQL Server |
| 7 | Modular monolith over microservices | Modules share User/Apartment/Property; premature splitting adds overhead at this scale |
| 8 | `ApartmentNumber` is a string on membership | User is the booking unit; apartment is informational only for MVP |
| 9 | Multiple residents per apartment allowed | Each user books independently regardless of shared apartment number |
| 10 | Time zone: Europe/Copenhagen only | Single-region MVP; multi-tz support deferred |
| 11 | Frontend routing: History API | Vite dev server + production server must serve `index.html` as fallback for all routes |

---

## Open Questions

- [ ] **Booking confirmation**: No notifications in MVP — should the booking confirmation just be a UI state change, or a dedicated confirmation page/email later?

## Resolved Decisions

| # | Question | Decision |
|---|---|---|
| A | Apartment entity or string? | String field (`ApartmentNumber`) on `UserComplexMembership`. User is the booking unit. |
| B | Multiple residents per apartment? | User is the determining factor. Multiple users may share an apartment number independently. |
| C | Time zone handling | MVP: Denmark (Europe/Copenhagen) only. |
| D | Frontend routing | History API (`/path`) — requires server/Vite config to serve `index.html` on unknown routes. |
