# LaundryBook — Implementation Plan (Pre-Launch)

> **How to use:** Each stage is scoped to a single Claude session.
> Say _"implement stage X"_ and Claude can start immediately — each stage
> has enough context to begin without re-reading this file.
>
> **Current status (2026-03-29):**
> - ✅ My Profile page
> - ✅ Sentry (frontend)
> - ✅ Mail service (Mailgun + templates)
> - ✅ Landing page skeleton (hero, 3 feature cards, basic CTA, minimal footer)
> - ⚠️ Bug: Admin "Force Password Reset" sends the **invite** template
>   (`ForcePasswordResetCommand.cs:36` calls `SendPasswordSetupEmailAsync` — should be `SendPasswordResetEmailAsync`)

---

## Phase A — Bug Fixes & Auth Reliability
*Fix everything broken before letting a single real user in.*

---

### Stage A1 — Fix admin force-password-reset email template

**What:** `ForcePasswordResetCommand` (admin-triggered reset) calls
`SendPasswordSetupEmailAsync` (the "Du er inviteret" template). Change it to
call `SendPasswordResetEmailAsync` instead.

**Files:**
- `src/Application/Features/Properties/Commands/ForcePasswordResetCommand.cs` — swap the method call

**Success criteria:**
- Admin clicks "Force Password Reset" on a user in the Users table
- User receives the "Nulstil din adgangskode" email (green header, 1-hour warning), not an invite email

---

### Stage A2 — Invite link expiry/reuse: clear frontend error states

**What:** A user clicking an expired (>7 days) or already-used invite token
currently gets a silent failure or raw API error. `JoinPage` needs explicit
error states for `INVITE_EXPIRED` and `INVITE_ALREADY_USED`.

**Files:**
- `frontend/src/pages/JoinPage.tsx`
- Backend: check `RedeemInviteCommand` handler — confirm it returns a
  distinguishable error code or message for expired vs. already-used tokens.
  If it returns a generic 400, add a domain-level error type.

**Success criteria:**
- Expired link → page shows: "Dette invitationslink er udløbet. Kontakt din administrator for et nyt link."
- Already-used link → page shows: "Dette link er allerede brugt. Log ind i stedet."
- No white screen, no unhandled console error in either case

---

### Stage A3 — Cancellation window: show limit before error

**What:** When a user has a booking inside the `CancellationWindowMinutes`
window, the cancel button gives a cryptic HTTP error. Show the limit
proactively: disable the button with a tooltip, or show the reason inside the
cancel confirmation dialog.

**Files:**
- `frontend/src/features/profile/BookingsOverview.tsx`
- `frontend/src/features/laundry/BookingGrid.tsx` (if cancel is also there)
- The property settings (incl. `CancellationWindowMinutes`) are likely already
  fetched — use that value to compute whether a booking is within the window
  client-side

**Success criteria:**
- Booking is within the window: cancel button is disabled, tooltip/note reads
  "Du kan ikke aflyse mindre end X timer før din booking"
- Booking is outside window: cancel works as normal
- User never sees a raw 400/409 for this case

---

## Phase P — Public-Facing Site, Sales Content & Demo
*Goal: a random stranger lands on laundrybook.dk and understands the product,
trusts it, and can try it themselves — without talking to you first.*

---

### Stage P1 — Landing page: full content pass

**What:** The current landing page has a hero, 3 minimal feature cards, and a
thin CTA banner. It needs to become a proper sales page. **This stage is
frontend-only, no backend.**

The file must be split into sub-components (current 260-line file will grow to
500+). Extract each section into `frontend/src/features/landing/`.

**Sections to build:**

1. **Hero** (exists, extend) — add a "Prøv gratis demo →" primary CTA and
   "Se hvordan det virker ↓" secondary CTA. Add a small social proof note
   under CTAs, e.g. "Bruges af ejerforeninger i hele Danmark."

2. **HowItWorksSection** (new) — 3-step visual flow, two columns:
   *For bestyrelsen:* Opret ejendom → Invitér beboere → Følg bookinger
   *For beboerne:* Modtag invitation → Log ind → Book en tid

3. **FeaturesSection** (expand current 3-card section) — 6–8 feature cards:
   - Nem booking fra mobil og computer
   - Ingen dobbeltbookinger (automatisk)
   - Flere vaskemaskiner i samme rum
   - Beboere inviteres via email eller QR-kode
   - Admin-overblik over alle bookinger
   - Aflysningstid der passer jeres forening
   - Privatindstillinger (se kun egne eller alles bookinger)
   - Ingen app-installation nødvendig

4. **PricingSection** (new) — simple 1-column card:
   - Price: "499 kr./år" (or whatever you decide — use a placeholder with TODO comment)
   - What's included: bullet list
   - 14-day free trial, no credit card required
   - CTA: "Start gratis prøveperiode"

5. **TestimonialsSection** (new) — placeholder layout for 2–3 quote cards.
   Mark clearly as placeholder so you remember to fill it. Can hide it behind
   a feature flag or just leave the placeholder visible until you have real quotes.

6. **FaqSection** (new) — accordion, 6–8 questions:
   - Kræver det en app?
   - Kan vi have flere vaskemaskiner?
   - Hvad sker der når prøveperioden udløber?
   - Kan beboerne se hvem der har booket?
   - Hvad koster det efter prøveperioden?
   - Kan vi aflyse vores abonnement?
   - Er vores data sikker?
   - Hvem kontakter vi hvis noget går galt?

7. **CtaBannerSection** (replace current thin blue banner) — strong mid-page
   CTA: "Klar til at prøve? Start din gratis prøveperiode i dag." with the
   demo signup button.

8. **AppFooter** (replace current minimal footer — this component will be
   reused across all public pages) — two columns:
   - Left: LaundryBook logo + tagline + copyright + CVR placeholder
   - Right: links to `/om-os`, `/kontakt`, `/guide`, `/datapolitik`, `/betingelser`

**Files:**
```
frontend/src/features/landing/
  HeroSection.tsx
  HowItWorksSection.tsx
  FeaturesSection.tsx
  PricingSection.tsx
  TestimonialsSection.tsx
  FaqSection.tsx
  CtaBannerSection.tsx
frontend/src/shared/AppFooter.tsx        ← reusable across all pages
frontend/src/pages/LandingPage.tsx       ← becomes thin orchestrator only
```

**Success criteria:**
- `LandingPage.tsx` is ≤80 lines (pure composition)
- A stranger reading the page understands: what it is, who it's for, what it
  costs, how to try it
- All 7 sections are present and render without errors
- `AppFooter` renders on the landing page with legal page links
- No hardcoded hex colors (all use `colors.*` from `shared/theme.ts`)

---

### Stage P2 — About page (`/om-os`) + Contact page (`/kontakt`)

**What:** Two new public pages establishing trust and giving people a way to
reach you. Both use the `AppFooter` from P1 and the `PublicNavbar`. The nav
should also link to these pages (add links to `PublicNavbar`).

**`/om-os` — Om LaundryBook:**
- Who built it and why (1–2 paragraphs, personal/honest tone)
- "Vi er ikke et stort softwarefirma — vi er boligejere der løste et problem vi selv havde"
- What makes it different from Vaskerum.dk (faster, modern, no-nonsense)
- A short "Vores mission" section
- Contact info: email address

**`/kontakt` — Kontakt os:**
- Intro: "Har du spørgsmål eller vil du høre mere? Vi svarer inden for 24 timer."
- Contact form: Navn, Email, Besked, Send-knap
- On submit: POST `/api/contact` → backend sends email to you via Mailgun
  (new `SendContactEmailAsync` on `IEmailService`). User sees a "Tak, vi
  vender tilbage hurtigst muligt" confirmation.
- Also display: email address as plain text (for people who prefer that)
- No phone number unless you want one

**PublicNavbar changes:**
- Add nav links: "Funktioner" (scroll to #features on landing) | "Pris" (scroll to #pricing) | "Om os" → `/om-os` | "Kontakt" → `/kontakt`
- Keep "Log ind" button on the right

**Files:**
```
frontend/src/pages/OmOsPage.tsx
frontend/src/pages/KontaktPage.tsx
frontend/src/shared/PublicNavbar.tsx        ← add nav links
frontend/src/app/routes.tsx                 ← add 2 public routes
src/Application/Common/Interfaces/IEmailService.cs   ← add SendContactEmailAsync
src/Infrastructure/Email/MailgunEmailService.cs       ← implement it
src/Infrastructure/Email/DevEmailService.cs           ← implement it
src/WebApi/Controllers/ContactController.cs           ← new controller
src/Application/Features/Contact/Commands/SendContactMessageCommand.cs   ← new
```

**Success criteria:**
- `/om-os` loads without login, has real content (not Lorem Ipsum)
- `/kontakt` form submits successfully; you receive the email in your inbox
- Form shows a success confirmation and clears on submit
- Invalid/empty form submission is prevented client-side (required fields)
- `PublicNavbar` links work on all public pages

---

### Stage P3 — User guide pages (`/guide`)

**What:** Two HTML guide pages — one for admins, one for residents — that can
be printed as PDFs by the browser. These serve as both in-browser documentation
and downloadable guides. No PDF generation library needed: `@media print` CSS
handles it.

**`/guide`** — index page with two cards: "Guide til administrator" and
"Guide til beboer" (links to the sub-pages).

**`/guide/administrator`** — step-by-step admin guide:
1. Opret din konto (via invitationslink eller demo)
2. Opret din ejendom (navn og adresse)
3. Tilføj vaskerum og maskiner
4. Opsæt tidslucke-skabeloner (åbningstider)
5. Justér indstillinger (aflysningsvindue, synlighed, maks. bookinger)
6. Invitér beboere (via email eller QR-kode)
7. Følg bookinger som administrator

**`/guide/beboer`** — resident guide:
1. Modtag invitationsemail og opret adgangskode
2. Log ind på LaundryBook
3. Book en tidslucke
4. Aflys en booking
5. Redigér din profil

Each step has: a numbered heading, 2–3 lines of explanation, and a gray
placeholder box where a screenshot can be inserted later (use a styled `<div>`
with "📸 Screenshot" text so they're easy to replace).

Add a "Print som PDF" button at the top that calls `window.print()`.
Use `@media print` CSS to hide the navbar, footer, and print button when printing.

Also link to the guides from the app's `AppNavbar` (help icon → `/guide`).

**Files:**
```
frontend/src/pages/GuidePage.tsx
frontend/src/pages/GuideAdminPage.tsx
frontend/src/pages/GuideBeboerPage.tsx
frontend/src/app/routes.tsx                  ← add 3 public routes
frontend/src/shared/AppNavbar.tsx            ← add help link
```

**Success criteria:**
- All 3 guide pages load without login
- Clicking "Print som PDF" opens the browser print dialog with a clean layout
  (no navbar/footer/button visible in print preview)
- Screenshot placeholders are visually obvious (easy for you to replace later)
- Admin guide has all 7 steps, resident guide has all 5 steps
- `/guide` index page links to both sub-pages

---

### Stage P4 — Demo system: backend

**What:** A self-service demo environment. A visitor fills in their name, email,
and property name on `/demo`, and within seconds they have a fully pre-seeded
demo property they can explore — no waiting, no contacting you.

**Domain changes:**
Add two fields to `Property`:
```csharp
public bool IsDemo { get; set; } = false;
public DateTime? DemoExpiresAt { get; set; }
```
New EF Core migration required.

**`CreateDemoPropertyCommand`** (Application layer):
- Input: `FirstName`, `LastName`, `Email`, `PropertyName`
- Creates a Firebase user for the demo admin
- Creates `Property` with `IsDemo = true`, `DemoExpiresAt = UtcNow + 14 days`
- Seeds `ComplexSettings` (defaults)
- Seeds `LaundryRoom`: "Vaskerum 1"
- Seeds 3 `LaundryMachine`s: "Vaskemaskine A", "Vaskemaskine B", "Tørretumbler"
- Seeds 5 `TimeSlotTemplate`s: 07–09, 09–11, 11–13, 14–16, 16–18
- Seeds 3 **demo resident** `User` records with fake `ExternalId`s (e.g.
  `demo-resident-{Guid}`) and `UserComplexMembership`s — these users are not
  real Firebase accounts and cannot log in; they exist only to populate the
  booking grid visually
- Seeds ~20 `Booking`s spread across the past 14 days and next 14 days,
  distributed across machines and slots, attributed to the 3 demo residents
  and the admin user
- Sends the password setup email to the demo admin so they can set a password
  and log in
- Returns: `{ propertyId, adminEmail, demoExpiresAt }`

**`DemoCleanupService`** (Infrastructure, `BackgroundService`):
- Runs once at startup, then every 24 hours
- Finds all `Property` records where `IsDemo == true && DemoExpiresAt < UtcNow`
- For each expired demo:
  1. Delete all `Booking`s in all rooms of this property
  2. Delete all `UserComplexMembership`s for this property
  3. Delete all `TimeSlotTemplate`s, `LaundryMachine`s, `LaundryRoom`s
  4. Delete `ComplexSettings`
  5. Delete the `Property`
  6. For each user who was a member: if they have no other memberships AND
     their `ExternalId` starts with `demo-resident-`, delete the `User` record
     (no Firebase call needed — fake account)
  7. For the demo admin user (real Firebase account): if they have no other
     memberships, delete Firebase account + `User` record
- After each cleanup run, update a `DemoCleanupStatus` record stored in a new
  `SystemSettings` table (one row, JSON or typed fields):
  `LastCleanupRun` (datetime), `LastCleanupCount` (int)

**`GetDemoStatusQuery`** (Application layer):
- Returns:
  - `ActiveDemoCount`: demos not yet expired
  - `ExpiringSoonCount`: expires within 48h
  - `RecentlyCleanedCount`: cleaned in last cleanup run
  - `LastCleanupRun`: datetime
  - `ActiveDemos`: list of `{ propertyName, adminEmail, createdAt, expiresAt, daysRemaining }`

**New controller:** `DemoController` — single public endpoint:
`POST /api/demo` → `CreateDemoPropertyCommand`

**Files:**
```
src/Domain/Entities/Property.cs                    ← add IsDemo, DemoExpiresAt
src/Domain/Entities/SystemSettings.cs              ← new entity (one-row config table)
src/Infrastructure/Persistence/AppDbContext.cs     ← add DbSet<SystemSettings>
src/Infrastructure/Migrations/                     ← new migration
src/Application/Features/Demo/Commands/CreateDemoPropertyCommand.cs
src/Application/Features/Demo/Queries/GetDemoStatusQuery.cs
src/Infrastructure/Demo/DemoCleanupService.cs
src/WebApi/Controllers/DemoController.cs
src/WebApi/Program.cs                              ← register DemoCleanupService
```

**Success criteria:**
- POST `/api/demo` with valid name/email/propertyName:
  - Returns 200 with `{ adminEmail, demoExpiresAt }`
  - Demo admin receives password setup email
  - Logging in as demo admin shows a pre-populated property with rooms,
    machines, timeslots, and bookings visible in the booking grid
- `DemoCleanupService` runs at startup (verify in logs)
- After manually setting `DemoExpiresAt` to 1 minute ago, the next cleanup
  run deletes the property and all related data
- `GET /api/demo/status` (SysAdmin only) returns the status DTO

---

### Stage P5 — Demo system: frontend

**What:** The demo signup flow and all UI surfaces for the demo system.

**`/demo` — Demo signup page (`DemoSignupPage.tsx`):**
- Clean, focused page (no app chrome, just `PublicNavbar` + `AppFooter`)
- Form: Fornavn, Efternavn, Email, Ejendomsnavn (required)
- Submits to `POST /api/demo`
- Loading state: "Opretter dit demo-miljø…" (takes 2–5 seconds)
- Success state: full-page confirmation card:
  "Dit demo-miljø er klar! Vi har sendt en email til [email] med dit login-link.
  Linket er gyldigt i 24 timer. Din demo udløber om 14 dage."
  With a "Tilbage til forsiden" link
- Error state: "Noget gik galt — prøv igen eller kontakt os."
- Prevent duplicate submissions (disable button after first click)

**Demo banner in app:**
- Both `AppLayout.tsx` and `AdminLayout.tsx` need to check if the user's
  active property has `isDemo === true` in the property data
- If yes, show a dismissible sticky banner at the very top (above everything):
  amber/yellow background, e.g.:
  "Demo-konto · Udløber [DemoExpiresAt formatted as 'd. MMMM yyyy'] ·
  Klar til at gå i gang? Kontakt os →"
- The property DTO from the API needs to expose `isDemo` and `demoExpiresAt`
  (add these fields to `PropertyDto` if not already there)
- Banner can be dismissed per-session (sessionStorage)

**SysAdmin demo panel:**
- New `frontend/src/features/sysadmin/DemoStatusPanel.tsx`
- Shows: active count, expiring-soon count, last cleanup run
- Table of active demos: Property name | Admin email | Created | Expires | Days left | Status badge
- Status badge: "Aktiv" (green), "Udløber snart" (amber, <48h), "Udløbet" (red)
- Add this panel to `SysAdminPage.tsx` as a new card above the existing PropertiesList

**Landing page "Prøv demo" CTA:**
- Wire up the "Prøv gratis demo" buttons from P1 to navigate to `/demo`
- (If P1 was done before P5, this is a 2-line change)

**RTK Query additions:**
- `POST /api/demo` mutation in a new `demoApi.ts` slice
- `GET /api/demo/status` query (SysAdmin only) — can go in `sysadminApi.ts`
  or a new slice

**Files:**
```
frontend/src/pages/DemoSignupPage.tsx
frontend/src/features/sysadmin/DemoStatusPanel.tsx
frontend/src/features/demo/demoApi.ts
frontend/src/shared/AppLayout.tsx                    ← demo banner
frontend/src/shared/AdminLayout.tsx                  ← demo banner
frontend/src/app/routes.tsx                          ← add /demo route
```

**Success criteria:**
- Visiting `/demo`, filling out the form, and submitting:
  - Shows loading state during the request
  - On success, shows confirmation with the email address
  - Demo admin receives password setup email
- Logging in as the demo admin shows the amber banner at the top of every page
- Banner shows the correct expiry date
- SysAdmin `/admin/system` page shows the demo status panel with correct counts
- "Prøv gratis demo" CTA on landing page navigates to `/demo`

---

### Stage P6 — SEO basics

**What:** The Vite SPA is invisible to search engines. Add the minimum
required for Google to index the site and understand what it is.

**What NOT to do here:** Full SSR/Next.js migration is out of scope. We use
`react-helmet-async` (or Vite's `vite-plugin-html`) for meta tags, plus static
files for robots/sitemap. This is enough to get indexed for brand searches and
long-tail Danish keywords.

**Changes:**
- Install `react-helmet-async` (if not already present), wrap app in `HelmetProvider`
- Add `<Helmet>` with `<title>` and `<meta name="description">` to:
  - `LandingPage.tsx` — "LaundryBook – Bookingsystem til vaskerum i ejerforeninger"
  - `OmOsPage.tsx` — "Om LaundryBook – Hvem vi er"
  - `KontaktPage.tsx` — "Kontakt LaundryBook"
  - `GuidePage.tsx` — "Brugerguide – LaundryBook"
- Create `frontend/public/robots.txt`:
  ```
  User-agent: *
  Allow: /
  Sitemap: https://laundrybook.dk/sitemap.xml
  ```
- Create `frontend/public/sitemap.xml` with public routes:
  `/`, `/om-os`, `/kontakt`, `/guide`, `/guide/administrator`, `/guide/beboer`
- Verify `index.html` has correct `lang="da"` on `<html>`
- Verify `<meta charset="utf-8">` and `<meta name="viewport">` are present

**Files:**
```
frontend/index.html
frontend/public/robots.txt
frontend/public/sitemap.xml
frontend/src/main.tsx                    ← HelmetProvider wrapper
frontend/src/pages/LandingPage.tsx
frontend/src/pages/OmOsPage.tsx
frontend/src/pages/KontaktPage.tsx
frontend/src/pages/GuidePage.tsx
```

**Success criteria:**
- Browser tab shows the correct `<title>` on each public page
- `robots.txt` is reachable at the deployed URL
- `sitemap.xml` is valid XML and lists all public routes
- Google Search Console can submit the sitemap without errors (manual check)
- `<html lang="da">` is set in `index.html`

---

## Phase B — Legal Minimum
*Required by GDPR before collecting any personal data from external users.*

---

### Stage B1 — Privacy Policy page (`/datapolitik`)

**What:** Static page in Danish. Must cover: data controller identity (your
name/address/email), what data is collected (name, email, apartment number,
booking history), legal basis (GDPR Art. 6.1b — contract), retention period,
data processors (Firebase, Mailgun, hosting provider), all 8 user rights,
Datatilsynet contact info. Link from `AppFooter` (built in P1).

**Files:**
- `frontend/src/pages/DatapolitikPage.tsx` (new)
- `frontend/src/app/routes.tsx` (add public route)

**Success criteria:**
- `/datapolitik` loads without login
- Contains all legally required sections (see checklist in `launch_PLAN.md` §1.2)
- Datatilsynet contact info is present
- Linked from `AppFooter` on every page

---

### Stage B2 — Terms & Conditions page (`/betingelser`)

**What:** Static page in Danish. Covers: who may use the service, subscription
model, cancellation policy, payment terms, liability, governing law (Danish law).

**Files:**
- `frontend/src/pages/BetingelserPage.tsx` (new)
- `frontend/src/app/routes.tsx` (add public route)

**Success criteria:**
- `/betingelser` loads without login
- Contains all required sections (see `launch_PLAN.md` §1.3)
- Linked from `AppFooter`

---

## Phase C — Admin Safety
*Prevent data integrity bugs before real bookings go live.*

---

### Stage C1 — Timeslot deletion: check for future booking conflicts

**What:** Fill the TODO at `PropertyTimeslotsPage.tsx:264`. Before deleting a
timeslot template, check if any future bookings reference it. If yes, show a
conflict warning modal.

**Backend:** New query `GetTimeslotConflictsQuery(Guid templateId)` → returns
list of `{ date, machineName, userName }` for future bookings that use this
template. Add endpoint to `PropertyTimeslotsController` or the existing laundry
controller.

**Frontend:**
- Before calling `deleteTimeSlot`, call the conflicts query first
- If conflicts exist: open a modal listing them with "Slet alligevel" / "Annuller"
- If no conflicts: delete immediately as before

**Files:**
```
src/Application/Features/Laundry/Queries/GetTimeslotConflictsQuery.cs
src/WebApi/Controllers/...                           ← add endpoint
frontend/src/pages/admin/properties/PropertyTimeslotsPage.tsx
frontend/src/features/laundry/laundryApi.ts          ← add conflicts query
```

**Success criteria:**
- Deleting a template with 2 future bookings → modal shows both bookings
- Admin clicks "Slet alligevel" → template and bookings are deleted
- Admin clicks "Annuller" → nothing is deleted
- Deleting a template with zero future bookings → deletes immediately, no modal

---

## Phase D — Observability

---

### Stage D1 — Sentry on .NET backend

**What:** Add `Sentry.AspNetCore` to the WebApi project. Configure via DSN
environment variable. Capture unhandled exceptions and slow requests.

**Files:**
- `src/WebApi/WebApi.csproj` — add `Sentry.AspNetCore` NuGet package
- `src/WebApi/Program.cs` — add `builder.WebHost.UseSentry(...)` with DSN from
  config, `TracesSampleRate`, and environment name

**Success criteria:**
- Throw a deliberate `throw new Exception("sentry test")` in a dev endpoint,
  verify the event appears in the Sentry dashboard
- DSN is read from environment variable, not hardcoded in source
- Remove the test endpoint after verifying

---

## Phase E — Payments
*Only start after Phase B (legal) is complete.*

---

### Stage E1 — Stripe subscription: backend

**What:** Add subscription billing. New `Subscription` domain entity. Commands
for starting a trial and cancelling. Webhook handler for Stripe events.

**New domain entity `Subscription`:**
```csharp
public Guid PropertyId { get; set; }
public string StripeCustomerId { get; set; }
public string StripeSubscriptionId { get; set; }
public SubscriptionStatus Status { get; set; }  // enum: Trial, Active, PastDue, Cancelled
public DateTime TrialEndsAt { get; set; }
public DateTime? CurrentPeriodEnd { get; set; }
```

**Commands/Queries:**
- `StartTrialCommand(Guid propertyId)` — creates Stripe Customer + Subscription
  with 14-day trial; stores IDs on `Subscription`
- `CancelSubscriptionCommand(Guid propertyId)` — cancels in Stripe at period end
- `GetSubscriptionStatusQuery(Guid propertyId)` → `SubscriptionDto`

**Webhook endpoint:** `POST /api/billing/webhook`
- Verifies Stripe signature
- Handles: `invoice.paid` → status = Active,
  `invoice.payment_failed` → status = PastDue,
  `customer.subscription.deleted` → status = Cancelled

**New EF migration** for `Subscription` table.

**Files:**
```
src/Domain/Entities/Subscription.cs
src/Domain/Enums/SubscriptionStatus.cs
src/Application/Features/Billing/Commands/StartTrialCommand.cs
src/Application/Features/Billing/Commands/CancelSubscriptionCommand.cs
src/Application/Features/Billing/Queries/GetSubscriptionStatusQuery.cs
src/Infrastructure/Billing/StripeService.cs
src/WebApi/Controllers/BillingController.cs
src/Infrastructure/Migrations/
```

**Success criteria:**
- Calling `StartTrialCommand` creates a Stripe Customer + Subscription in the
  Stripe test dashboard
- `invoice.paid` webhook marks subscription as Active (test with Stripe CLI)
- `customer.subscription.deleted` webhook marks as Cancelled
- Stripe signature verification rejects tampered webhooks

---

### Stage E2 — Stripe subscription: frontend

**What:** Billing management page in the admin area.

**`/admin/billing` page:**
- Shows current plan: Trial (X days remaining) / Active / PastDue / Cancelled
- "Aktivér abonnement" → calls `POST /api/billing/checkout` which returns a
  Stripe Checkout session URL → redirect
- After Stripe redirects back: shows updated status
- "Opsig abonnement" → confirmation modal → calls cancel endpoint
- Shows next billing date when active
- Shows "Abonnement er opsagt — adgang til [date]" when cancelled

**RTK slice:** `frontend/src/features/billing/billingApi.ts`

**Files:**
```
frontend/src/pages/admin/BillingPage.tsx
frontend/src/features/billing/billingApi.ts
frontend/src/app/routes.tsx                      ← add /admin/billing
```

**Success criteria:**
- Admin sees current subscription status on the billing page
- Full flow: Trial → click "Aktivér" → Stripe Checkout → success redirect →
  status updates to "Aktiv"
- Cancellation modal works and updates status

---

## Phase F — Pre-Launch QA
*Run this before inviting paying customers.*

---

### Stage F1 — Mobile smoke-test pass

**What:** Open the app on a real 375px (iPhone SE) viewport. Fix layout issues
on the booking grid, navigation, and modals.

**Files:** whatever breaks during testing — likely `BookingGrid.tsx` styles,
modal sizing, and possibly `AppNavbar`.

**Success criteria:**
- Login → booking grid → make a booking: works on a 375px viewport
- No horizontal overflow on any tested page
- All tap targets ≥ 44px height

---

### Stage F2 — SPF/DKIM + email deliverability check

**What:** Non-code task. Verify Mailgun DNS records for `laundrybook.dk`.
Test deliverability.

**Steps:**
1. Mailgun dashboard → Sending → Domains → verify SPF + DKIM show "Verified"
2. Send a test invite email and password reset email to yourself
3. Check with mail-tester.com (aim for ≥ 8/10)
4. Confirm both email types land in Gmail inbox, not spam

**Success criteria:**
- Mailgun DNS tab: all records "Verified"
- mail-tester.com score ≥ 8/10
- Test emails land in inbox, not spam folder

---

## Completion order summary

| Stage | What | Must do before... |
|-------|------|-------------------|
| A1 | Fix force-reset template bug | Anyone uses admin actions |
| A2 | Invite expiry error states | First external user |
| A3 | Cancellation window UX | First bookings |
| P1 | Landing page full content | Public site goes live |
| P2 | About + Contact pages | Public site goes live |
| P3 | User guides | Inviting first testers |
| P4 | Demo backend | Demo is live |
| P5 | Demo frontend | Demo is live |
| P6 | SEO basics | Caring about organic traffic |
| B1 | Privacy policy | Any external user (legally required) |
| B2 | Terms & Conditions | Any external user (legally required) |
| C1 | Timeslot conflict check | Bookings go live |
| D1 | Backend Sentry | Production traffic |
| E1 | Stripe backend | Taking payment |
| E2 | Stripe frontend | Taking payment |
| F1 | Mobile QA | Paying customers |
| F2 | SPF/DKIM | Any email goes out |

**Minimum to invite first beta/test users (people you know):**
A1 + A2 + A3 + B1 + B2 + P2 (contact page) + F2

**Minimum for a public demo site (strangers can find and try it):**
All of the above + P1 + P3 + P4 + P5 + P6

**Minimum for paying customers:**
Everything + C1 + D1 + E1 + E2 + F1
