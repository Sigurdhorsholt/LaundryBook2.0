# Test User Readiness — Game Plan

---

## Must-do before inviting anyone

### Auth & Account
- **Forgot password / password reset** — already implemented end-to-end. Test it manually before inviting. Specifically: does the reset email arrive, does the link expire correctly at 1 hour, does it handle already-used tokens gracefully?
- **My Profile page** — currently missing entirely. Users can't edit their own name, apartment number, or change their password post-registration. This will feel broken to any real user. Needs: `PUT /api/auth/profile` endpoint + a `/profile` page.
- **Expired/invalid invite link** — test what happens when a user clicks a 7-day-expired email invite or an already-used token. Is there a clear error, or does the join page just silently fail?

### Weird states to guard against
- User joins via QR with a typo in their apartment number — no way to correct it without admin intervention (since there's no profile edit page)
- User creates a Firebase account but `RedeemInviteCommand` fails halfway — they're stuck with a Firebase account and no app record
- Admin deletes a time slot that has future bookings (open TODO on `PropertyTimeslotsPage.tsx:264`)
- User tries to book when `MaxConcurrentBookingsPerUser` is 1 and they already have one — make sure the error message is readable, not a raw 409
- Admin invites someone, user never redeems, admin resends — does the old token get invalidated?

---

## Legal / Compliance

### Cookie consent
For a Danish/EU product: cookie consent is required only for **non-essential** cookies. Your JWT is in an httpOnly session cookie — strictly necessary, exempt from consent. If you have zero analytics or third-party tracking scripts, you likely don't need a banner. Audit your scripts before concluding this.

### GDPR
Since you're collecting emails, names, and apartment numbers:
- You need a **Privacy Policy** page (what data, why, how long, who can request deletion)
- A brief one-pager is fine for test users — improve it before public launch
- A **Data Processing Agreement (DPA)** is required for real rollout: ejerforeningen is the controller, you are the processor. For testing with known people, a verbal acknowledgment is enough. Prepare a DPA template before commercial use.

---

## Reliability & Observability

### Error tracking
Sentry is not overkill — free tier, ~15 min setup (one SDK install + DSN). Without it you're blind when a user hits a bug and silently stops using the app. Add it to the frontend at minimum. Backend integration is 5 more minutes.

### Logging
Backend already has structured exception middleware + `ILogger`. For test phase this is fine — but confirm logs are actually visible somewhere (not just stdout that disappears). If hosting on Railway/Render/Azure, verify logs are piped to a console or log drain.

---

## Email Templates

Mailgun setup is working, templates are in Danish. Before inviting:
- Send yourself a test invite email and a test password reset email
- Check rendering in Gmail, Outlook, and mobile
- Confirm `noreply@laundrybook.dk` doesn't land in spam — check SPF/DKIM records on your Mailgun domain
- Setup email expires in 24h, reset in 1h — make sure the email copy says this explicitly

---

## UI/UX Gaps Likely to Confuse Test Users

- **Dashboard is near-empty** — after login, residents hit a blank page before redirecting to `/laundry`. Make sure the redirect is instant and obvious.
- **No name shown in navbar** — only email is displayed. Improves once profile page exists.
- **Booking visibility setting** — if set to `ApartmentOnly`, verify what is actually shown. Real users will ask "who booked that slot?"
- **Cancellation window UX** — if `CancellationWindowMinutes` is e.g. 120, the user should see "cannot cancel within 2 hours" somewhere visible, not just get a cryptic error after attempting.
- **Mobile** — if any test user is on a phone, the booking grid is the riskiest component. Smoke-test it.

---

## Prioritized Checklist

| # | Item | Effort | Priority |
|---|------|--------|----------|
| 1 | Test password reset flow manually | Low | Critical |
| 2 | My Profile page (edit name, apartment, change password) | Medium | High |
| 3 | Sentry on frontend (and optionally backend) | Low | High |
| 4 | Write a 1-page Privacy Policy | Low | High |
| 5 | Test invite edge cases (expired, reused, mid-flow failure) | Low | High |
| 6 | Check email spam / SPF+DKIM on Mailgun domain | Low | High |
| 7 | Timeslot deletion conflict check (open TODO) | Medium | Medium |
| 8 | Cancellation window message visible to user before error | Low | Medium |
| 9 | Cookie audit — confirm no third-party scripts | Low | Low |
| 10 | Mobile smoke-test on booking grid | Low | Medium |

---

The two biggest actual gaps in the codebase are **My Profile** and **Sentry**. Everything else is configuration, testing, or legal text.
