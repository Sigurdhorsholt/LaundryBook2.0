# LaundryBook Web — UI Kit

Click-through recreation of the LaundryBook web app. Faithful to the production codebase (React + TS + Vite + Bootstrap 5 + Tailwind v4), but built as inline JSX so it runs without a build step.

Flow:
1. **Landing page** — public hero, features, footer. Click **Log ind** to open the login modal.
2. **Login modal** — any email + any password works (faked).
3. **Resident booking** (`/laundry`) — date strip, upcoming-booking card, slot grid. Book and cancel live.
4. **Admin dashboard** (`/admin`) — stats, property cards, sectioned sidebar nav.

Components:
- `App.jsx` — router/shell + fake auth state
- `LandingPage.jsx`
- `LoginModal.jsx`
- `ResidentBookingPage.jsx`
- `AdminDashboardPage.jsx`
- `shared.jsx` — Icons, BrandLogo, Navbar, Sidebar, primitives

Swap components in/out by commenting the `<Route>` lines at the top of `App.jsx`.
