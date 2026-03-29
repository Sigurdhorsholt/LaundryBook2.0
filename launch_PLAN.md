# 🚀 LaundryBook — Pre-Launch Implementation Plan

> **Goal:** Launch LaundryBook.dk as a competitive, legally compliant, and market-ready SaaS alternative to Vaskerum.dk.
> 
> **How to use this file:** Check off each item as you complete it. Items marked 🔴 are legally required before taking paying customers in Denmark.

---

## Phase 1 — Legal & Compliance (🔴 Must complete before launch)

### 1.1 Register & Verify Business
- [ ] Register CVR number via Virk.dk if not already done
  - 📎 [Register your business — virk.dk](https://virk.dk/myndigheder/stat/ERST/selvbetjening/Registrering_Enkeltmandsvirksomhed/)
  - 📎 [Guide to business types in Denmark (IVS, ApS, ENK)](https://startupdenmark.info/start-a-company/)
- [ ] Choose correct business type (ENK = enkeltmandsvirksomhed is simplest to start)
- [ ] Add CVR number visibly in the footer of the website
- [ ] Open a dedicated business bank account
- [ ] Register for VAT (moms) if revenue exceeds 50.000 DKK/year
  - 📎 [SKAT momsregistrering](https://www.skat.dk/erhverv/moms/momsregistrering)

---

### 1.2 Privacy Policy / Persondatapolitik (GDPR) 🔴
*Required by law before collecting any personal data (name, email, etc.) from users in Denmark/EU.*

- [ ] Draft a GDPR-compliant privacy policy in Danish
- [ ] Include: data controller identity, address, and contact email
- [ ] Specify what personal data is collected (name, email, zip code, booking activity)
- [ ] State the legal basis for processing (GDPR Art. 6.1b — contract fulfilment)
- [ ] Describe how long data is retained
- [ ] List all data processors (hosting, payment provider, analytics)
- [ ] Describe all 8 user rights (access, rectification, deletion, restriction, portability, objection, automated decisions, complaint)
- [ ] Include Datatilsynet contact info:
  - Borgergade 28, 5. sal, 1300 København K
  - 📞 33 19 32 00 | dt@datatilsynet.dk
- [ ] Publish privacy policy at a permanent URL (e.g. `/datapolitik`)
- [ ] Link to it from the footer on every page

**Resources:**
- 📎 [Datatilsynet — Guidance for small businesses](https://www.datatilsynet.dk/vejledning-og-vaerktoejer/vejledninger/vejledning-til-smaa-virksomheder)
- 📎 [Datatilsynet — GDPR overview in Danish](https://www.datatilsynet.dk/hvad-siger-reglerne/grundlaeggende-begreber)
- 📎 [EU GDPR full text (English)](https://gdpr-info.eu/)
- 📎 [Free privacy policy template generator (iubenda)](https://www.iubenda.com/en/privacy-and-cookie-policy-generator)
- 📎 [Vaskerum.dk privacy policy (example)](https://vaskerum.dk/datapolicy.html)

---

### 1.3 Terms & Conditions / Handelsbetingelser 🔴
*Required before any subscription or payment can be taken.*

- [ ] Draft terms and conditions document in Danish
- [ ] Include: who may use the service (private, small associations)
- [ ] Define the subscription model (annual, auto-renewal)
- [ ] State cancellation policy (how, when, and what happens to data)
- [ ] Define payment terms (invoice due date, consequences of non-payment)
- [ ] Include liability disclaimer (uptime, data loss, etc.)
- [ ] Add clause on right to modify the terms (with notice to user)
- [ ] Include governing law clause (Danish law)
- [ ] Publish at a permanent URL (e.g. `/betingelser`)
- [ ] Link to it from the footer and at the point of signup/checkout

**Resources:**
- 📎 [Forbrugerombudsmanden — e-commerce rules in Denmark](https://www.forbrugerombudsmanden.dk/vejledninger/e-handel/)
- 📎 [Forbrugerrettigheder ved digitale abonnementer](https://www.forbrug.dk/raad-og-guides/digitale-tjenester/abonnementer/)
- 📎 [Vaskerum.dk terms (example)](https://vaskerum.dk/conditions.html)
- 📎 [TermsFeed — free terms generator](https://www.termsfeed.com/terms-conditions-generator/)

---

### 1.4 Cookie Policy & Consent Banner 🔴
*Required by Danish cookie rules (Cookiebekendtgørelsen) if you use any tracking, analytics, or third-party scripts.*

- [ ] Audit which cookies your site sets (analytics, session, payment, marketing)
- [ ] Categorize them: strictly necessary vs. functional vs. analytics vs. marketing
- [ ] Implement a cookie consent banner that blocks non-essential cookies until accepted
- [ ] Write a cookie policy page and link from the banner and footer
- [ ] Do NOT use Google Analytics or Facebook Pixel before consent is given

**Resources:**
- 📎 [Datatilsynet — Cookie rules in Denmark](https://www.datatilsynet.dk/hvad-siger-reglerne/cookies)
- 📎 [Erhvervsstyrelsen — Cookievejledning](https://www.retsinformation.dk/eli/lta/2011/1148)
- 📎 [Cookiebot — free consent management (up to 1 domain)](https://www.cookiebot.com/)
- 📎 [Cookie Information — Danish provider](https://cookieinformation.com/da/)

---

## Phase 2 — Website & Landing Page

### 2.1 Landing Page Content
- [ ] Write a clear Danish hero headline (value prop in one sentence)
- [ ] Add a sub-headline explaining the product simply
- [ ] Add a "Kom i gang" / CTA button above the fold
- [ ] Write a "Sådan virker det" / concept section (3–5 bullet points or steps)
- [ ] Add feature list with icons (multi-machine support, mobile-friendly, easy user invites, etc.)
- [ ] Add a pricing section (see Phase 3)
- [ ] Add a testimonials / social proof section (even 2–3 beta users helps)
- [ ] Add a footer with: CVR, email, links to terms and privacy policy

**Resources:**
- 📎 [Vaskerum.dk landing page (competitor reference)](https://vaskerum.dk/)
- 📎 [Copywriting for SaaS landing pages — Demand Curve guide](https://www.demandcurve.com/playbooks/landing-page)

---

### 2.2 SEO — Make the Site Crawlable
*Your current JS-only site is invisible to Google. This must be fixed.*

- [ ] Implement server-side rendering (SSR) or static site generation (SSG)
  - Recommended: Next.js (SSR/SSG), Astro (static), or a separate HTML landing page
- [ ] Add `<title>` and `<meta description>` tags with Danish keywords
- [ ] Include keywords: "vaskebooking", "bookingsystem vaskerum", "online vasketavle", "bookingsystem til ejerforening"
- [ ] Add an XML sitemap at `/sitemap.xml`
- [ ] Submit sitemap to Google Search Console
- [ ] Add `robots.txt`
- [ ] Ensure page loads in under 3 seconds on mobile

**Resources:**
- 📎 [Google Search Console](https://search.google.com/search-console/)
- 📎 [Next.js SSR docs](https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering)
- 📎 [Ahrefs free keyword research tool](https://ahrefs.com/keyword-generator)
- 📎 [Google PageSpeed Insights](https://pagespeed.web.dev/)

---

### 2.3 Guide / Onboarding Page
- [ ] Create an admin setup guide (create laundry room → add machines → invite users)
- [ ] Create a resident user guide (how to log in and book a time slot)
- [ ] Add an FAQ section covering common questions
- [ ] Include screenshots or a short screen recording / GIF

**Resources:**
- 📎 [Vaskerum.dk guide page (example)](https://vaskerum.dk/guides.html)
- 📎 [Scribe — auto-generate step-by-step guides from screen recordings](https://scribehow.com/)
- 📎 [Loom — free screen recording for demos](https://www.loom.com/)

---

## Phase 3 — Pricing & Payments

### 3.1 Define Pricing
- [ ] Decide on price point (Vaskerum charges 720 kr./year — match, beat, or justify a premium)
- [ ] Decide billing cycle: annual only, or monthly option too
- [ ] Decide on free trial length and terms (Vaskerum = 14 days, no card required)
- [ ] Decide what happens at trial end (auto-pause, downgrade to free, require payment)
- [ ] Display pricing clearly on the landing page with VAT included

---

### 3.2 Payment Integration 🔴
*Required before you can take real paying customers.*

- [ ] Choose a payment provider:
  - **Stripe** — easiest for subscriptions, supports Danish cards, no MobilePay natively
  - **Quickpay + MobilePay** — very common in Denmark, good for Danish market
  - **Nets Easy** — popular Danish option with MobilePay built in
- [ ] Implement subscription billing with automatic renewal
- [ ] Implement invoice/receipt generation (required by Danish bookkeeping law)
- [ ] Test the full payment flow end-to-end (trial → subscribe → renew → cancel)
- [ ] Store payment records for minimum 5 years (Danish bookkeeping requirement)
  - 📎 [Bogføringsloven — Erhvervsstyrelsen](https://erhvervsstyrelsen.dk/bogfoeringsloven)

**Resources:**
- 📎 [Stripe — subscription billing docs](https://stripe.com/docs/billing/subscriptions/overview)
- 📎 [Quickpay — Danish payment gateway](https://quickpay.net/)
- 📎 [Nets Easy — MobilePay + cards](https://nets.eu/da-dk/losninger/online-betalinger/nets-easy)
- 📎 [MobilePay developer docs](https://developer.mobilepay.dk/)

---

## Phase 4 — Core App Functionality

### 4.1 Admin Features
- [ ] Create laundry room (name, address)
- [ ] Add machines (up to N washers and dryers)
- [ ] Set booking time slots (duration, opening hours)
- [ ] Invite users via email
- [ ] Remove/disable users
- [ ] View all upcoming bookings
- [ ] Manage subscription from within the app

### 4.2 User Features
- [ ] Register via invite link or email
- [ ] Log in (password or magic link)
- [ ] View available slots by machine and date
- [ ] Book a slot
- [ ] Cancel own booking
- [ ] Receive email confirmation on booking
- [ ] View own upcoming bookings

### 4.3 Technical Reliability
- [ ] Mobile-responsive on iOS and Android browsers
- [ ] Works without a native app install (PWA or web)
- [ ] Handles concurrent bookings correctly (no double-booking)
- [ ] Sends email notifications reliably (use SendGrid, Resend, or Postmark)
- [ ] Error logging in place (use Sentry or similar)
- [ ] Regular database backups configured

**Resources:**
- 📎 [Resend — transactional email for developers](https://resend.com/)
- 📎 [Sentry — error tracking](https://sentry.io/)
- 📎 [Uptime monitoring — UptimeRobot (free)](https://uptimerobot.com/)

---

## Phase 5 — Trust & Social Proof

### 5.1 Before Launch
- [ ] Recruit 3–5 beta testers (friends in housing associations, ejerforeninger)
- [ ] Collect written testimonials from beta users
- [ ] Get at least one testimonial from each user type: resident, admin/chairman, property manager
- [ ] Add testimonials to the landing page with name and role (city optional)

### 5.2 After Launch
- [ ] Add a case study or "Kundehistorie" page
- [ ] Ask happy customers for a Google review
- [ ] Set up a simple NPS or feedback form after onboarding

---

## Phase 6 — Go-to-Market

### 6.1 Pre-Launch
- [ ] Set up a "Kom snart" / waitlist or email capture page
- [ ] Define your target customer: ejerforeninger, andelsboligforeninger, private udlejere
- [ ] Write 3–5 outreach email templates (cold outreach to housing associations)

### 6.2 Launch Channels
- [ ] Post in relevant Facebook groups (e.g. "Ejerforeninger i Danmark")
- [ ] List on Trustpilot (free business profile)
- [ ] List on Pricerunner or Sortlist if applicable
- [ ] Reach out to ejendomsadministratorer directly
- [ ] Consider Google Ads targeting "vaskebooking" and "bookingsystem vaskerum"

**Resources:**
- 📎 [Find ejerforeninger — BBR Ejendomsregister](https://bbr.dk/)
- 📎 [Google Ads — getting started](https://ads.google.com/intl/da_dk/home/how-it-works/)
- 📎 [Trustpilot — free business signup](https://business.trustpilot.com/)

---

## Phase 7 — Post-Launch Monitoring

- [ ] Set up Google Analytics (with proper cookie consent)
- [ ] Set up uptime monitoring alerts
- [ ] Monitor for payment failures and follow up with customers
- [ ] Review and respond to any support emails within 24 hours
- [ ] Check Datatilsynet for any new GDPR guidance relevant to your product
- [ ] Review and update privacy policy and terms annually

---

## ✅ Launch Checklist — Final Gate

Do not launch to paying customers until all of these are checked:

- [ ] CVR number visible in footer
- [ ] Privacy policy published and linked
- [ ] Terms & conditions published and linked
- [ ] Cookie consent banner working
- [ ] Payment flow tested end-to-end
- [ ] Trial signup flow tested end-to-end
- [ ] Cancellation flow tested
- [ ] All emails (confirmation, invoice, cancellation) tested
- [ ] Site loads correctly on mobile
- [ ] Landing page has pricing and contact info
- [ ] Legal pages reviewed by a lawyer (recommended, not required)
  - 📎 [Dansk Erhverv — legal services for small businesses](https://www.danskerhverv.dk/)
  - 📎 [Lexly — online legal documents in Danish](https://www.lexly.dk/)

---

*Last updated: March 2026*
