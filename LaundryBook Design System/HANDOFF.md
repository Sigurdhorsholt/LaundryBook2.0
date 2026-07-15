# Handoff — Porting the LaundryBook Design System into your repo

You've downloaded a zip of the full design project. This file tells Claude CLI what to do with it.

---

## What's in this package

```
assets/                       Fonts (Inter), logos, favicons
colors_and_type.css           Design tokens as CSS custom properties
README.md                     Context, content fundamentals, visual foundations
SKILL.md                      Prompt for Claude — how to use this system
preview/                      20 review cards (colors, type, components, etc.)
ui_kits/laundrybook-web/      Clickable prototype — all pages in inline JSX
  index.html                  Entry
  App.jsx                     Fake router + auth
  shared.jsx                  Color constants (mirror of theme.ts), Icons, Navbar, Sidebar
  public-shell.jsx            PublicLayout, PublicNavbar, PublicFooter, PhotoPlaceholder, LogoWall
  LandingPage.jsx             3 hero variants
  AboutPage.jsx
  FeaturesPage.jsx
  DemoPage.jsx                Embeds the live booking grid
  PricingPage.jsx             Flat fee per building, 4 tiers
  FaqPage.jsx
  LoginModal.jsx
  ResidentBookingPage.jsx
  AdminDashboardPage.jsx
  TweaksPanel.jsx             Hero variant switcher
```

## Where to put it in your repo

```
LaundryBook2.0/
├── design/                   ← unzip here
│   ├── ui_kits/laundrybook-web/
│   ├── preview/
│   ├── assets/
│   ├── colors_and_type.css
│   ├── README.md
│   └── SKILL.md
├── frontend/
└── ...
```

Add to `.gitignore` if you don't want design refs checked in, or commit them for the whole team's reference — your call.

---

## Prompt for Claude Code CLI

Copy this to the CLI after you've placed the package in `design/`.

> I have a design reference package under `design/`. Read `design/README.md` and
> `design/SKILL.md` first to understand the system.
>
> The JSX files under `design/ui_kits/laundrybook-web/` are **inline-JSX prototypes**,
> not production code. They mirror our repo's conventions: Bootstrap 5 classes,
> colors that map to `frontend/src/shared/theme.ts`, Inter font.
>
> I want you to port the **public-facing pages** (Landing, About, Features, Demo,
> Pricing, FAQ) into real TypeScript components in
> `frontend/src/pages/public/`. Rules:
>
> 1. Use the existing `colors` export from `frontend/src/shared/theme.ts` —
>    **do not** copy the inline `C` object from `shared.jsx`. Every `C.primary`
>    becomes `colors.primary`, etc.
> 2. Use icon components from `frontend/src/shared/icons.tsx`. Only add new ones
>    if missing.
> 3. Use React Router — replace the fake `route`/`go` props with `useNavigate`
>    and `Link`.
> 4. Keep the Bootstrap + inline-style pattern used elsewhere in the repo.
>    Don't introduce Tailwind utility classes beyond what's already there.
> 5. `PhotoPlaceholder` — leave the SVG illustrations in place as
>    `<img src="/public-images/…" />` placeholders and create empty files in
>    `frontend/public/public-images/` so the team can drop real photos later.
> 6. The `LogoWall` component stays as-is for now (placeholder SVG logos).
> 7. Add routes to the router for `/`, `/about`, `/features`, `/demo`,
>    `/pricing`, `/faq`. Keep them accessible whether the user is logged in or
>    not (the existing auth gate stops at `/laundry` and `/admin`).
> 8. Preserve Danish copy exactly as written.
>
> Start with the shared shell (`PublicLayout` → `frontend/src/pages/public/PublicLayout.tsx`)
> and the Landing page. Then show me the result before porting the other pages.

---

## Notes on the port

- **Tokens map 1:1.** Every color in `shared.jsx`'s `C` object has an equivalent in `frontend/src/shared/theme.ts`. If a color is missing from theme.ts (shouldn't be), add it there rather than inlining.
- **Three hero variants.** `LandingPage.jsx` supports `warmsage | deepblue | editorial`. The Tweaks panel switches between them. For production, pick one — `warmsage` is the current default and the warmest fit for the "ejerforening" tone. The others can live in a branch if you want to A/B.
- **Demo page embeds the real booking grid.** In production you'll want a simplified/sandboxed version — don't wire it to real API calls. Either mock the RTK Query endpoints or gate it behind a `?demo=1` flag.
- **Pricing math** is hard-coded (199 / 349 / 549). Move to a CMS or env if that'll change.
- **FAQ** uses a simple local `useState` accordion. Fine as-is, or swap for Bootstrap's `<Accordion>` for a11y.
- **Inline `C` object** — the prototype uses it because it runs without a build step. Your real app uses `theme.ts`. That's the main rewrite when porting.

---

## If something doesn't match the repo

Ask Claude CLI to check `frontend/src/pages/LandingPage.tsx` and the existing `AppNavbar.tsx` / `AdminLayout.tsx` to stay consistent. The prototype was written against those files but drifts a little for demonstration purposes (bigger nav height, photo placeholders, etc.). Match the existing file when in doubt.
