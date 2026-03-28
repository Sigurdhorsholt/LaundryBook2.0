# Booking UX/UI Improvement Plan

> Based on Don Norman's Emotional Design framework (Visceral → Behavioral → Reflective).
> All tasks are independent unless noted. Color scheme task is **last** — it touches every file.

---

## Implementation order

Do **Tasks 4–7 first** (shared `BookingGrid` component — data-independent, inherited by the real resident page for free).
Then **build the real resident booking page**, then implement Tasks 1–3, 8–9 there (and backport to preview).
Task 10 requires the real page to exist. Task 11 always last.

| # | Task | Where | Order |
|---|------|--------|-------|
| 4 | Row hover state | `BookingGrid.tsx` | **Now** |
| 5 | Booking confirmation micro-animation | `BookingGrid.tsx`, `index.css` | **Now** |
| 6 | Contextual empty/blocked states | `BookingGrid.tsx` | **Now** |
| 7 | Skeleton loading | `BookingGrid.tsx`, `index.css` | **Now** |
| — | Build real resident booking page | new page + RTK Query | After 4–7 |
| 1 | "I dag"/"I morgen" language | Resident page (+ preview) | After real page |
| 2 | Availability dots on date strip | Resident page (+ preview) | After real page |
| 3 | Upcoming booking card | Resident page (+ preview) | After real page |
| 8 | Cancellation time-signal friction | Resident page (+ preview) | After real page |
| 9 | Social context line | Resident page (+ preview) | After real page |
| 10 | Routine acknowledgment | Resident page only | After real page |
| 11 | Color scheme centralization | All files | **Last** |

---

## Progress

### Phase 1 — BookingGrid improvements (do now)

- [x] **Task 4** — Row hover state
- [x] **Task 5** — Booking confirmation micro-animation
- [x] **Task 6** — Contextual empty and blocked states
- [x] **Task 7** — Skeleton loading

### Phase 2 — Real resident booking page

- [x] Build resident booking page with RTK Query integration

### Phase 3 — Data-dependent UX (implement on real page, backport to preview)

- [x] **Task 1** — "I dag" / "I morgen" language in date strip
- [x] **Task 2** — Availability dots on date strip
- [x] **Task 3** — Upcoming booking card
- [x] **Task 8** — Cancellation time-signal friction
- [x] **Task 9** — Social context line
- [x] **Task 10** — Routine acknowledgment *(real page only)*

### Phase 4 — Color scheme (last)

- [ ] **Task 11, Step 1** — Create `src/shared/theme.ts` with all color tokens
- [ ] **Task 11, Step 2** — Add CSS variables to `src/index.css`
- [ ] **Task 11, Step 3** — Update `src/shared/constants.ts` to use theme
- [ ] **Task 11, Step 4a** — Replace colors: `shared/ui/` (PageHeader, EmptyState, Spinner, FormError)
- [ ] **Task 11, Step 4b** — Replace colors: `shared/BrandLogo.tsx`, `shared/AdminLayout.tsx`
- [ ] **Task 11, Step 4c** — Replace colors: `features/laundry/BookingGrid.tsx`
- [ ] **Task 11, Step 4d** — Replace colors: `pages/admin/properties/` (all 6 files)
- [ ] **Task 11, Step 4e** — Replace colors: `pages/admin/AdminDashboardPage.tsx`
- [ ] **Task 11, Step 4f** — Replace colors: `pages/LandingPage.tsx`
- [ ] **Task 11, Step 4g** — Replace colors: `pages/laundry/LaundryPage.tsx` (resident page)
- [ ] **Task 11, Step 5** — Choose and apply final palette (current blue / Fresh Teal / Warm Sage)
- [ ] **Task 11, Step 6** — Verification (`tsc --noEmit` + visual check + palette swap test)

---

## Task 4 — Row hover state in BookingGrid ✅

- **File:** `BookingGrid.tsx` — `SlotRow` component
- **Norman level:** Visceral + Behavioral

**What:** When hovering an *available* slot row, the entire row highlights, signalling "this is clickable". No hover effect on taken/past/locked rows. The full row becomes the click target.

**How:**

Add local hover state to `SlotRow`:
```typescript
const [hovered, setHovered] = useState(false)
```

Update the row container — add event handlers, cursor, and hover background:
```tsx
<div
  onMouseEnter={() => setHovered(true)}
  onMouseLeave={() => setHovered(false)}
  onClick={isClickable ? onBook : undefined}
  style={{
    backgroundColor:
      booking?.isOwn                          ? '#f0fdf4' :
      takenByOther                            ? '#f2f4f7' :
      (hovered && isClickable)                ? '#f0f5ff' :
                                                '#ffffff',
    cursor: isClickable ? 'pointer' : 'default',
  }}
>
```

Book button gets `pointerEvents: 'none'` and `tabIndex={-1}` — it's purely visual affordance, the row handles the click.

**Result:** Click area becomes full row width — easier on mobile. Row invites interaction before commitment.

---

## Task 5 — Booking confirmation micro-animation ✅

- **Files:** `BookingGrid.tsx`, `src/index.css`
- **Norman level:** Visceral — the emotional payoff moment

**What:** When a slot transitions to "own booking", the row pulses briefly into green before settling. When cancelled, it flashes back to white.

**How:**

Keyframes added to `src/index.css`:
```css
@keyframes slot-booked {
  0%   { transform: scaleX(0.98); background-color: #c8e6c9; }
  60%  { transform: scaleX(1.005); }
  100% { transform: scaleX(1);    background-color: #f0fdf4; }
}

@keyframes slot-cancelled {
  0%   { background-color: #ffcdd2; }
  100% { background-color: #ffffff; }
}
```

In `SlotRow`, detect transitions using a ref:
```typescript
const prevBookingRef = useRef<GridBooking | null>(null)

useEffect(() => {
  const prev = prevBookingRef.current
  prevBookingRef.current = booking
  if (prev === null && booking?.isOwn) {
    setJustBooked(true)
    const t = setTimeout(() => setJustBooked(false), 500)
    return () => clearTimeout(t)
  }
  if (prev?.isOwn && booking === null) {
    setJustCancelled(true)
    const t = setTimeout(() => setJustCancelled(false), 400)
    return () => clearTimeout(t)
  }
}, [booking])
```

**Result:** The booking moment has a payoff. The row earns its green state visibly.

---

## Task 6 — Contextual empty and blocked states ✅

- **File:** `BookingGrid.tsx`
- **Norman level:** Behavioral — agency and guidance

**Three cases implemented:**

**A — All slots taken:** banner at top: *"Ingen ledige tider denne dag."*

**B — maxReached:** single banner: *"Du har nået din bookinggrænse. Aflys en aktiv booking for at frigøre en plads."* — replaces per-row text. Blocked rows just dim silently.

**C — No slots configured:** two-line centered message with heading + explanation, replacing the single flat line.

---

## Task 7 — Skeleton loading for slots ✅

- **Files:** `BookingGrid.tsx`, `src/index.css`
- **Norman level:** Behavioral — perceived performance

**What:** `loading?: boolean` prop on `BookingGrid`. When true, renders 8 `SlotSkeleton` rows — same height and shape as real rows, pulsing grey. No layout jump, no spinner floating above the grid.

**Keyframe added to `src/index.css`:**
```css
@keyframes skeleton-pulse {
  0%, 100% { opacity: 1;    }
  50%       { opacity: 0.45; }
}
```

`BookingPreviewPage` passes `loading={slotsLoading}` directly to `<BookingGrid>` — the external `{slotsLoading ? <Spinner /> : <BookingGrid />}` wrapper is gone.

---

## Task 1 — "I dag" / "I morgen" language in the date strip

- **File:** Resident booking page (+ `BookingPreviewPage.tsx` backport)
- **Norman level:** Behavioral — temporal anchoring
- **Implement:** After real resident page is built

**What:**
- Today → **"I dag"** + small dot indicator below the day number
- Tomorrow → **"I morgen"**
- All other dates → keep `ma` / `ti` / `on` etc.

**How:**

Add helper alongside existing `dateParts()`:
```typescript
function dateShortLabel(dateStr: string, todayStr: string): string {
  if (dateStr === todayStr)             return 'I dag'
  if (dateStr === addDays(todayStr, 1)) return 'I morgen'
  const parts = dateStr.split('-').map(Number)
  const d = new Date(parts[0] ?? 2025, (parts[1] ?? 1) - 1, parts[2] ?? 1)
  return DAY_SHORT[d.getDay()] ?? ''
}
```

In the date strip button, replace `short` with `dateShortLabel(date, todayStr)`.

Add dot beneath today:
```tsx
{date === todayStr && (
  <span style={{
    width: 4, height: 4, borderRadius: '50%', marginTop: 2, display: 'block',
    backgroundColor: isSelected ? 'rgba(255,255,255,0.7)' : '#1565c0',
  }} />
)}
```

**Result:** Strip reads *"I dag · I morgen · on · to · fr · lø · sø"* — time-aware, not calendar-mechanical.

---

## Task 2 — Availability dots on the date strip

- **File:** Resident booking page (+ `BookingPreviewPage.tsx` backport)
- **Norman level:** Behavioral — scan the whole week at a glance
- **Implement:** After real resident page is built

**What:** Colored dot beneath each date button. Three states: green (slots free), amber (1–2 left), grey (full or locked/past).

**How:**

```typescript
const availabilityByDate = useMemo((): Record<string, 'free' | 'few' | 'full' | 'past'> => {
  const result: Record<string, 'free' | 'few' | 'full' | 'past'> = {}
  for (const date of visibleDates) {
    if (date < todayStr || (lookaheadEnd !== null && date > lookaheadEnd)) {
      result[date] = 'past'; continue
    }
    // On real page: count from API bookings. In preview: count from previewBookings.
    const bookedCount = bookings.filter(
      (b) => b.date === date && b.roomId === effectiveRoomId
    ).length
    const free = activeSlots.length - bookedCount
    result[date] = free === 0 ? 'full' : free <= 2 ? 'few' : 'free'
  }
  return result
}, [visibleDates, bookings, effectiveRoomId, activeSlots, todayStr, lookaheadEnd])

const DOT_COLOR: Record<string, string> = {
  free: '#4caf50', few: '#f59e0b', full: '#e0e0e0', past: 'transparent',
}
```

Render inside each date button (below the day number):
```tsx
<span style={{
  width: 5, height: 5, borderRadius: '50%', display: 'block', marginTop: 2,
  backgroundColor: isSelected ? 'rgba(255,255,255,0.6)' : DOT_COLOR[availabilityByDate[date] ?? 'free'],
}} />
```

**Result:** No hunting through days to find availability. Full week readable in one glance.

---

## Task 3 — Upcoming booking card

- **File:** Resident booking page (+ `BookingPreviewPage.tsx` backport)
- **Norman level:** Behavioral + Reflective — kills the "do I have a booking?" anxiety
- **Implement:** After real resident page is built

**What:** Card above the grid showing the user's nearest future booking. Disappears when they have none.

```
┌─────────────────────────────────────────────────────┐
│ DIN NÆSTE BOOKING                                    │
│ Onsdag 2. april  ·  10:00 – 11:30  ·  Vaskerum 1   │
│                                         [Aflys]     │
└─────────────────────────────────────────────────────┘
```

**How:**

Compute next booking (real page: from API; preview: from `previewBookings`):
```typescript
const nextBooking = useMemo(() => {
  return [...bookings]
    .filter((b) => b.userId === currentUserId && b.date >= todayStr)
    .sort((a, b) => a.date < b.date ? -1 : a.date > b.date ? 1 : 0)[0] ?? null
}, [bookings, currentUserId, todayStr])
```

Render between page header and room/date controls:
```tsx
{nextBooking && nextBookingSlot && (
  <div className="rounded-3 mb-4 p-3 d-flex align-items-center justify-content-between gap-3"
    style={{ backgroundColor: '#f0fdf4', border: '1px solid #c8e6c9' }}>
    <div>
      <p className="mb-0" style={{ fontSize: '0.7rem', fontWeight: 700, color: '#2e7d32',
        textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        Din næste booking
      </p>
      <p className="mb-0 mt-1" style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0d1b2a' }}>
        {dateParts(nextBooking.date).fullLabel}
        {' · '}{formatTime(nextBookingSlot.startTime)} – {formatTime(nextBookingSlot.endTime)}
        {nextBookingRoom && ` · ${nextBookingRoom.name}`}
      </p>
    </div>
    <button className="btn btn-sm btn-outline-danger flex-shrink-0"
      style={{ borderRadius: 7, fontSize: '0.78rem' }}
      onClick={() => openCancelConfirm(nextBooking.slotId, nextBooking.date)}>
      Aflys
    </button>
  </div>
)}
```

---

## Task 8 — Cancellation time-signal friction

- **File:** Resident booking page confirm modal (+ preview backport)
- **Norman level:** Behavioral + Reflective — commitment awareness
- **Implement:** After real resident page is built

**What:** When canceling a booking that starts within 4 hours, the confirm modal shows a time-awareness warning. Not blocking — just makes the user pause.

**How:**

Helper:
```typescript
function minutesUntilSlot(date: string, startTime: string): number {
  const parts = startTime.split(':').map(Number)
  const slotDate = new Date(
    parseInt(date.slice(0, 4)),
    parseInt(date.slice(5, 7)) - 1,
    parseInt(date.slice(8, 10)),
    parts[0] ?? 0, parts[1] ?? 0, 0, 0,
  )
  return Math.floor((slotDate.getTime() - Date.now()) / 60_000)
}
```

Add `minutesUntil?: number` to `ConfirmModal` props. Render warning when canceling within 240 minutes:
```tsx
{type === 'cancel' && minutesUntil !== undefined && minutesUntil >= 0 && minutesUntil < 240 && (
  <p style={{
    fontSize: '0.8rem', color: '#b45309',
    backgroundColor: '#fff8e1', border: '1px solid #ffe0b2',
    borderRadius: 6, padding: '6px 10px', marginBottom: 16,
  }}>
    {minutesUntil < 60
      ? `Der er kun ${minutesUntil} minutter til din booking starter.`
      : `Der er ${Math.floor(minutesUntil / 60)} time${Math.floor(minutesUntil / 60) === 1 ? '' : 'r'} til din booking starter.`
    }
  </p>
)}
```

---

## Task 9 — Social context line

- **File:** Resident booking page (+ preview backport)
- **Norman level:** Reflective — community rhythm
- **Implement:** After real resident page is built

**What:** One quiet line beneath the grid: *"2 andre beboere har booket denne dag"*. Never reveals who.

**How:**

```typescript
const othersBookedCount = useMemo(() => {
  const uniqueUsers = new Set(
    bookings
      .filter((b) =>
        b.date === selectedDate &&
        b.roomId === effectiveRoomId &&
        b.userId !== currentUserId
      )
      .map((b) => b.userId)
  )
  return uniqueUsers.size
}, [bookings, selectedDate, effectiveRoomId, currentUserId])
```

Render beneath grid:
```tsx
{othersBookedCount > 0 && (
  <p style={{ fontSize: '0.76rem', color: '#a0adb8', textAlign: 'center', marginTop: 8, marginBottom: 0 }}>
    {othersBookedCount === 1
      ? '1 anden beboer har booket denne dag'
      : `${othersBookedCount} andre beboere har booket denne dag`}
  </p>
)}
```

**Note:** Count is always shown regardless of `BookingVisibility` — a count is not personal data.

---

## Task 10 — Routine acknowledgment

- **File:** Resident booking page only — not in admin preview
- **Norman level:** Reflective — quiet recognition of habit
- **Implement:** After real resident page is built. **Not in preview.**

**What:** After every 5th booking, a single understated line: *"Du har nu booket 10 gange — godt gået."* No badge, no streak, no pressure.

**How:**

Track in `localStorage`:
```typescript
function getBookingCount(): number {
  return parseInt(localStorage.getItem('laundryBookingCount') ?? '0', 10)
}
function incrementBookingCount(): number {
  const next = getBookingCount() + 1
  localStorage.setItem('laundryBookingCount', String(next))
  return next
}
```

In the post-confirm success handler:
```typescript
const newCount = incrementBookingCount()
if (newCount % 5 === 0) setMilestoneCount(newCount)
```

Show milestone line (auto-dismisses after 4 seconds):
```tsx
{milestoneCount !== null && (
  <p style={{ fontSize: '0.76rem', color: '#5a6a7a', textAlign: 'center', marginTop: 10 }}>
    Du har nu booket {milestoneCount} gange — godt gået.
  </p>
)}
```

---

## Task 11 — Color scheme centralization and palette redesign

> **This task must be done last.** It touches every file in the frontend.

### Background

Colors are currently **hardcoded hex values in inline styles scattered across 15+ files**. The only partial centralization is `ROLE_BADGE_STYLE` in `constants.ts`. No CSS variables, no theme file.

This task: (1) extracts all colors into a single file, (2) exposes them as both TypeScript constants and CSS variables, (3) replaces every hardcoded hex in every component, (4) makes the entire color scheme changeable by editing one file.

---

### Step 1 — Create `src/shared/theme.ts`

```typescript
// src/shared/theme.ts
// Single source of truth for all UI colors.
// To change the color scheme: edit the primary cluster below.
// Everything else propagates automatically.

export const colors = {

  // ── Brand / Primary ─────────────────────────────────────────────────────────
  primary:          '#1565c0',   // ← change this to retheme the whole app
  primaryLight:     '#e8f0fe',
  primaryLighter:   '#f0f5ff',
  primaryBorder:    '#c5d9fb',
  primaryMuted:     '#dce8ff',
  primaryMutedText: '#2c4f8c',
  primaryAccent:    '#3d5a8a',

  // ── Text ────────────────────────────────────────────────────────────────────
  textPrimary:   '#0d1b2a',
  textSecondary: '#5a6a7a',
  textMuted:     '#a0adb8',
  textDisabled:  '#c0ccd8',

  // ── Surfaces ─────────────────────────────────────────────────────────────────
  bgPage:   '#f8fafb',
  bgCard:   '#ffffff',
  bgSubtle: '#f0f4f8',
  bgMuted:  '#f4f6f8',

  // ── Borders ──────────────────────────────────────────────────────────────────
  borderDefault: '#e8ecf0',
  borderStrong:  '#d0d8e0',

  // ── Semantic states ───────────────────────────────────────────────────────────
  successText:   '#2e7d32',   successBg:   '#f0fdf4',   successBorder: '#c8e6c9',
  warningText:   '#b45309',   warningBg:   '#fff8e1',   warningBorder: '#ffe0b2',
  dangerText:    '#c62828',   dangerBg:    '#fce4ec',   dangerBorder:  '#f8bbd0',
  infoText:      '#1565c0',   infoBg:      '#e8f0fe',   infoBorder:    '#c5d9fb',

  // ── Booking-specific ──────────────────────────────────────────────────────────
  slotOwnBg:        '#f0fdf4',
  slotTakenBg:      '#f2f4f7',
  slotTakenText:    '#8a9aaa',
  slotNewBadgeBg:   '#e3f0ff',
  slotNewBadgeText: '#1565c0',

  // ── Sidebar ──────────────────────────────────────────────────────────────────
  sidebarLinkDefault:    '#4a5568',
  sidebarLinkHoverBg:    '#f5f7fa',
  sidebarLinkActiveBg:   '#e8f0fe',
  sidebarLinkActiveText: '#1565c0',

  // ── Roles ────────────────────────────────────────────────────────────────────
  roleResident:     { bg: '#f0f4f8', text: '#5a6a7a' },
  roleComplexAdmin: { bg: '#e8f0fe', text: '#1565c0' },
  roleOrgAdmin:     { bg: '#e8f5e9', text: '#2e7d32' },
  roleSysAdmin:     { bg: '#fce4ec', text: '#c62828' },

} as const

export type ColorToken = keyof typeof colors
```

---

### Step 2 — Add CSS variables to `src/index.css`

```css
:root {
  --color-primary:        #1565c0;
  --color-primary-light:  #e8f0fe;
  --color-text-primary:   #0d1b2a;
  --color-text-secondary: #5a6a7a;
  --color-text-muted:     #a0adb8;
  --color-bg-page:        #f8fafb;
  --color-bg-card:        #ffffff;
  --color-bg-subtle:      #f0f4f8;
  --color-border:         #e8ecf0;
  --color-success:        #2e7d32;
  --color-warning:        #b45309;
  --color-danger:         #c62828;
}
```

Update existing `.sidebar-link` classes to use variables:
```css
.sidebar-link           { color: var(--color-text-secondary); }
.sidebar-link:hover     { background-color: var(--color-bg-subtle); color: var(--color-text-secondary); }
.sidebar-link--active   { color: var(--color-primary); background-color: var(--color-primary-light); }
```

---

### Step 3 — Update `src/shared/constants.ts`

```typescript
import { colors } from './theme'

export const ROLE_BADGE_STYLE: Record<UserRole, { bg: string; color: string }> = {
  [UserRole.Resident]:     { bg: colors.roleResident.bg,     color: colors.roleResident.text },
  [UserRole.ComplexAdmin]: { bg: colors.roleComplexAdmin.bg, color: colors.roleComplexAdmin.text },
  [UserRole.OrgAdmin]:     { bg: colors.roleOrgAdmin.bg,     color: colors.roleOrgAdmin.text },
  [UserRole.SysAdmin]:     { bg: colors.roleSysAdmin.bg,     color: colors.roleSysAdmin.text },
}
```

---

### Step 4 — File-by-file replacement

Replace all hardcoded `'#xxxxxx'` hex values with `colors.*` tokens.
Add `import { colors } from '../../shared/theme'` (adjust depth) to each file.

**Files ordered by complexity:**

| File | Complexity |
|------|------------|
| `shared/ui/PageHeader.tsx` | Low |
| `shared/ui/EmptyState.tsx` | Low |
| `shared/ui/Spinner.tsx` | Low |
| `shared/ui/FormError.tsx` | Low |
| `shared/BrandLogo.tsx` | Low |
| `shared/AdminLayout.tsx` | Medium |
| `features/laundry/BookingGrid.tsx` | Medium |
| `pages/admin/properties/PropertySettingsPage.tsx` | Medium |
| `pages/admin/properties/PropertyUsersPage.tsx` | Medium |
| `pages/admin/properties/PropertyBookingsPage.tsx` | Medium |
| `pages/admin/properties/LaundryRoomsPage.tsx` | Medium |
| `pages/admin/AdminDashboardPage.tsx` | Medium |
| `pages/admin/properties/PropertyTimeslotsPage.tsx` | Large |
| `pages/admin/properties/BookingPreviewPage.tsx` | Large |
| `pages/LandingPage.tsx` | Large |
| `pages/laundry/LaundryPage.tsx` (resident page) | Large |

**Replacement pattern:**
```typescript
// Before
style={{ color: '#5a6a7a', backgroundColor: '#f0f4f8' }}

// After
import { colors } from '../../shared/theme'
style={{ color: colors.textSecondary, backgroundColor: colors.bgSubtle }}
```

---

### Step 5 — Alternative palettes (pick one)

Swap only the `primary` cluster in `theme.ts`. Everything else propagates.

**Option A — Fresh Teal** (cleanliness, freshness)
```typescript
primary:         '#0f7ea6',
primaryLight:    '#e0f4fa',
primaryLighter:  '#f0fafd',
primaryBorder:   '#b3e0ef',
primaryMuted:    '#d0eef8',
primaryMutedText:'#0c5f7a',
primaryAccent:   '#1a6e8a',
```

**Option B — Warm Sage** (domestic, approachable)
```typescript
primary:         '#3d7a5c',
primaryLight:    '#e8f5ee',
primaryLighter:  '#f2faf5',
primaryBorder:   '#b8ddc9',
primaryMuted:    '#d0ecdb',
primaryMutedText:'#2a5c42',
primaryAccent:   '#336650',
textPrimary:     '#1a2e24',
```

---

### Step 6 — Verification

1. `npx tsc --noEmit` — zero errors
2. Search `src/` for remaining `'#` occurrences — should be zero outside of `theme.ts` and `index.css`
3. Test swap: change to Option A, reload app, verify all pages update correctly
4. Revert to chosen final palette
