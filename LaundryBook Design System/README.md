# LaundryBook Design System

A design system for **LaundryBook 2.0** — a modular SaaS platform for apartment building management. Currently scoped to the **Laundry Booking** module (rolling out Resource Booking, Residents Directory, Announcements, Issue Reporting, and Document Storage).

The product targets small Danish ejerforeninger, andelsforeninger and small private rental buildings (6–80 apartments, volunteer boards, minimal technical expertise). Each building ("opgang") is a workspace with optional modules.

**Audience in-product:** residents ("Beboer") and admins ("Ejendomsadmin", "Organisationsadmin", "Systemadmin"). The UI is in **Danish**.

---

## Sources

Everything here was derived from the codebase, not from screenshots.

- **Repo:** https://github.com/Sigurdhorsholt/LaundryBook2.0 (branch `main`)
- **Core token file:** `frontend/src/shared/theme.ts` — ships three palettes (Blue, Fresh Teal, **Warm Sage** — currently active)
- **CSS variables:** `frontend/src/index.css`
- **Icons:** `frontend/src/shared/icons.tsx` — hand-rolled 24×24 SVG set, 2px stroke
- **Brand logo:** `frontend/public/washing-machine-fav-icon.{png,svg}`
- **UX spec:** `frontend/UX_IMPROVEMENT_PLAN.md` — Don Norman emotional-design framing (Visceral → Behavioral → Reflective) that justifies many of the micro-animations, availability dots, and "Din næste booking" card patterns documented here
- **Arch & domain model:** `PLAN.md`, `CLAUDE.md`

Tech stack: **React 19 + TypeScript + Vite + Redux Toolkit + RTK Query**, with **Bootstrap 5** + **Tailwind v4 utilities** layered together. Bootstrap's Reboot handles reset; Tailwind's preflight is skipped.

---

## Index

Root files:
- `colors_and_type.css` — all color, type, spacing, radius and shadow tokens as CSS variables
- `README.md` (this file)
- `SKILL.md` — Agent-Skill front matter for cross-project use

Folders:
- `assets/` — logos, fonts. Inter is loaded from Google Fonts (see caveat below)
- `preview/` — HTML cards that populate the Design System tab
- `ui_kits/laundrybook-web/` — high-fidelity React recreation of the web app (landing page, resident booking, admin dashboard, admin property page)

---

## Products represented

LaundryBook ships **one product**: a responsive React web app served from Vite. Two distinct UI surfaces:

1. **Public / marketing** — `pages/LandingPage.tsx`. Danish-language hero on a deep-blue gradient, feature grid, CTA banner, footer. Even when the active primary palette is Warm Sage, the landing hero retains the original LaundryBook blue gradient (`#0a1929` → `#0d3b7a` → `#1565c0`). Treat this as a brand motif, not a bug.
2. **Authenticated app** — split into:
   - **Resident** (`/laundry`, `/my-page`, `/dashboard`): sticky translucent navbar over a white page. Primary surface is the `BookingGrid` — a weekly date strip with availability dots, upcoming-booking card, and a list of bookable timeslot rows.
   - **Admin** (`/admin/...`): `AdminLayout` with a 256px-wide bg-white sidebar (sectioned nav) and a `bgPage` content area. Property-scoped sub-nav replaces top-level nav when you drill into an ejendom.

---

## Content Fundamentals

**Language.** All in-product copy is **Danish**. Direct but polite — addresses users with the informal "du".

**Tone.** Practical, quiet, low-drama. The UX spec explicitly invokes Don Norman: the app aims for an emotional arc of **Visceral → Behavioral → Reflective**. Micro-copy supports this — empty states offer guidance, not apology; confirmation lines are understated.

**Casing.** Sentence case for everything. No title case on buttons or headings. Button verbs are infinitive-y or imperative ("Log ind", "Aflys", "Log ud", "Læs mere").

**Eyebrow labels** (tiny uppercase, letter-spaced `0.08em`) mark a handful of specific contexts — "DIN NÆSTE BOOKING" above the upcoming-booking card, sidebar section labels ("Oversigt", "Administration", "Vaskerum"). Otherwise uppercase is avoided.

**I vs you.** Second-person "du/dine" ("Dine ejendomme", "Din næste booking", "Du har nået din bookinggrænse"). Never first-person plural.

**Emoji.** Never. Not in components, not in copy.

**Unicode glyphs.** Used sparingly as separators — `·` (middle dot) joins metadata on a single line (`Onsdag 2. april  ·  10:00 – 11:30  ·  Vaskerum 1`). En-dash `–` separates time ranges. Arrow `←` on back links ("← Tilbage til login", "← Tilbage").

**Concrete examples from the codebase.**

| Surface | Copy |
|---|---|
| Hero badge | "Vaskebooking til ejerforeninger" |
| Hero headline | "Simpel digital booking til vaskerummet" |
| Hero subtitle | "Undgå konflikter om vasketider. Giv beboerne et enkelt system til at booke vaskerum — tilgængeligt fra mobil og computer." |
| Feature title | "Nem booking" |
| Feature body | "Beboerne booker en vask på få sekunder — fra mobil eller computer, når det passer dem." |
| Empty (no slots today) | "Ingen ledige tider denne dag." |
| Max reached | "Du har nået din bookinggrænse. Aflys en aktiv booking for at frigøre en plads." |
| Milestone (every 5th) | "Du har nu booket 10 gange — godt gået." |
| Social context | "2 andre beboere har booket denne dag" |
| Cancel warning | "Der er kun 45 minutter til din booking starter." |
| Date strip | "I dag · I morgen · on · to · fr · lø · sø" |

**Vibe.** Civic and utilitarian — closer to a well-run municipal portal than a consumer app. It respects the user's time and assumes they are busy.

---

## Visual Foundations

### Color

Three palettes ship in `theme.ts`. Only the **primary cluster** changes between them; text/surface/border/semantic tokens are palette-neutral.

- **Blue** (`#1565c0`) — original identity. Still used on the landing-page hero gradient.
- **Fresh Teal** (`#0f7ea6`) — cleanliness/freshness.
- **Warm Sage** (`#3d7a5c`) — **active in production**. Domestic, approachable. Also shifts `textPrimary` to `#1a2e24` (green-tinted dark) for cohesion.

Stable neutrals (all palettes): `bgPage #f8fafb`, `bgCard #ffffff`, `bgSubtle #f0f4f8`, `borderDefault #e8ecf0`, `borderStrong #d0d8e0`, `textSecondary #5a6a7a`, `textMuted #a0adb8`.

Semantic: success `#2e7d32`, warning `#b45309`, danger `#c62828` — each with a tinted bg and matching border.

Booking-grid specific: "my booking" rows get `slotOwnBg #f0fdf4` + green text; taken-by-other rows are silenced to `slotTakenBg #f2f4f7`; the row-level hover tint is `primaryLighter`.

Availability dots beneath the date strip: **green** (free), **amber** (1–2 left), **grey** (full/past).

### Type

Family: `'Inter', system-ui, sans-serif`. Weights used: 400, 500, 600, 700, 800.

Sizes are **small and calm** — the app prefers `0.85rem` body text and reserves `1.6rem+` for page titles. Hero copy scales with `clamp()`.

Key roles (`.ds-h1`, `.ds-h2`, `.ds-eyebrow`, `.ds-body`, etc.) are defined in `colors_and_type.css`.

Tracking is **slightly tight** on large display text (`-0.3px` to `-0.5px`) and **wide** (`0.08em`–`0.09em`) on uppercase eyebrows.

### Spacing & layout

- Bootstrap 5 grid + utility classes carry most layout.
- Cards are padded `p-3` (12px) to `p-4` (16px); page shells use `p-4 p-lg-5`.
- **Fixed elements:** sticky navbar at 56px with `backdrop-filter: blur(10px)` and `rgba(255,255,255,0.96)` fill. Admin sidebar is a fixed 256px column (becomes offcanvas slide-in on `<lg`).
- **Max content width** comes from Bootstrap's `.container-xl`.

### Backgrounds

No illustrations, no patterns, no textures. The landing hero uses a **linear gradient** (`150deg, #0a1929 → #0d3b7a → #1565c0`) — the only gradient in the system. Everywhere else it's flat color. Photography is **not used** in the repo at all.

### Corner radii

Consistently soft: `4px` (tiny chips), `7px` (sidebar links, small buttons), `10px` (large CTAs, hero buttons), `12px` (empty-state dashed frames), `999px` (badges, pills). Modals and cards land at `8–10px`.

### Borders

- Default `1px solid #e8ecf0` — the "invisible" hairline that defines almost every card.
- Strong `1.5px dashed #d0d8e0` — empty-state frame.
- Row dividers `#f0f4f8` between list items.
- Landing-page hero uses white-at-low-opacity borders on glassy pill badges and ghost buttons.

### Shadows

Very restrained. Two hover elevations:
- `0 4px 16px rgba(13, 59, 122, 0.09)` — card hover (property cards)
- `0 8px 32px rgba(13, 59, 122, 0.10)` — feature-card lift on landing page
- `0 4px 24px rgba(0, 0, 0, 0.22)` — high-contrast CTA button on hero only

No inner shadows. No neon glows.

### Animation & hover/press

- **Row hover** on bookable slots: background flips to `primaryLighter`, cursor becomes pointer, the entire row is the click target.
- **Booking confirmation** (`@keyframes slot-booked`): 500ms — row briefly scales down to `0.98`, background flashes `#c8e6c9`, then settles on `slotOwnBg`.
- **Cancellation** (`@keyframes slot-cancelled`): 400ms — red tint flash back to white.
- **Skeleton pulse** (`@keyframes skeleton-pulse`): `opacity 1 → 0.45 → 1`.
- **Card hover** on landing: `translateY(-3px)` + shadow over `0.2s`.
- Sidebar link hover: `background-color` and `color` transition `0.15s`.
- No bounces, no spring physics, no page transitions. Everything is short (≤500ms) and functional.

### Transparency & blur

- **Navbar** — `rgba(255,255,255,0.96)` with `backdrop-filter: blur(10px)`. The only use of blur in the system.
- **Hero overlays** — white at `0.1`/`0.2`/`0.35` opacity for badges, ghost-button borders, subtitle text.
- Avoided elsewhere. Body text is opaque.

### Cards

- White (`bgCard #fff`), `border: 1px solid borderDefault`, `border-radius: 10–12px`, padding `16–24px`.
- No inherent shadow; shadow only on hover (see above).
- Stat cards, property cards, feature cards all follow this template.

### Capsules vs gradients

**Capsules.** Pill-shaped badges (`border-radius: 999px`) carry role labels, the hero "Vaskebooking til ejerforeninger" tag, and availability/status markers. Role badges pair a 12.5px label with a bg/text pair from `theme.colors.role*`.

**Gradients** are reserved for the landing hero. Everywhere else is flat.

---

## Iconography

- **System:** the project ships its own **hand-rolled 24×24 SVG icon set** in `src/shared/icons.tsx`. Stroke-based, 2px stroke (some at 1.8 for decorative hero icons), `strokeLinecap="round"`, `strokeLinejoin="round"`, `fill="none"`, `color: currentColor` by default. Each icon is a small React function component accepting `size`, `color`, `strokeWidth` props.
- **Set:** `IconGrid, IconBuilding, IconCalendar, IconCalendarCheck, IconUsers, IconSettings, IconClock, IconChevronLeft, IconChevronRight, IconChevronDown, IconMoreVertical, IconPlus, IconCheck, IconMenu, IconShield, IconBrand`. These are the only icons in production.
- **Brand mark.** The favicon is a simple concentric-circles-with-cardinal-tick SVG (`IconBrand`) used both as the browser tab icon (`washing-machine-fav-icon.svg/png`) and in the navbar (`BrandLogo` renders `IconBrand` at size 18–22). Despite the filename "washing-machine", the glyph itself is an abstract compass/brand mark.
- **Emoji:** never.
- **Unicode-as-icon:** only `·`, `–`, `←` as typographic punctuation (see Content Fundamentals).
- **PNGs as icons:** none in the UI — only the favicon has a PNG fallback.
- **When to substitute:** style-match to the existing set — Lucide / Feather are the nearest visual cousins (same 24×24, 2px stroke, rounded joins) and can drop in without visual rupture. Prefer extending `icons.tsx` over importing a library to keep bundle size tight.

See `assets/washing-machine-logo.svg` / `.png` for the brand mark and `preview/icons.html` for the complete set rendered at production size.

---

## Caveats & substitutions

- **Inter** is loaded from Google Fonts here (`@import url(...)`). The production app relies on system/WOFF delivery; behaviorally identical, but if pixel-perfect font metrics matter, ship the Inter WOFF2 files directly.
- **Bootstrap 5** is assumed available where the production component uses `.btn`, `.row`, `.container-xl`, etc. The preview HTML files pull Bootstrap from a CDN for fidelity.
- **Firebase/RTK Query** calls in the real components are stubbed out in the UI kit — it's a visual recreation, not a functional app.

---

## Using the UI kit

See `ui_kits/laundrybook-web/index.html` for an interactive click-through that lets you move between the landing page, login modal, resident booking grid, and admin dashboard. Individual JSX components live alongside `index.html` and are loaded via Babel standalone.
