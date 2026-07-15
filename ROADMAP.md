# LaundryBook - launch roadmap

Status: pre-launch, no real foreninger yet. This file tracks what stands between "it works"
and "real associations can safely rely on it", plus how we differentiate and what comes next.

Legend: `[ ]` todo · `[~]` in progress · `[x]` done · ⭐ = gap not on the original list · 🔒 = legal/security must-have

## Competitor context (why priorities look like this)

- **vaskerum.dk** - software-only but capped: 5 vaskemaskiner + 5 tørretumblere, 30 brugere, ét
  vaskerum. 60 kr/vaskerum/md, 14 dages gratis prøve.
- **vaskekælder.dk** - 10 kr/lejlighed/md, ingen binding. Har allerede **påmindelser,
  venteliste med notifikationer og forbrugsstatistik**.

Takeaway: reminders + waitlist + stats are **parity, not differentiation** - vaskekælder already
ships them. We build them so we don't look behind, and differentiate elsewhere (see below).

---

## P0 - launch blockers (before a single real forening)

### Legal / GDPR 🔒
- [~] Privatlivspolitik (offentlig side) - scaffoldet som `/privatliv` (udkast, mangler juridisk gennemgang + udfyldte TODO'er)
- [~] Handelsbetingelser / vilkår (offentlig side) - scaffoldet som `/vilkaar` (udkast, mangler juridisk gennemgang)
- [x] Vis vilkår + privatliv før signup, med samtykke-checkbox (Signup + Join, klient-side)
- [ ] ⭐ Registrér samtykke server-side ved oprettelse (tidsstempel + politik-version) - i dag kun klient-side
- [ ] ⭐ **Databehandleraftale (DPA)** pr. forening - foreningen er dataansvarlig, LaundryBook er
      databehandler (GDPR art. 28). Juridisk påkrævet.
- [ ] ⭐ Underdatabehandler-liste (Render, mailudbyder, m.fl.)
- [ ] ⭐ Fortegnelse over behandlingsaktiviteter
- [ ] ⭐ Dataopbevaring + ret til sletning + dataeksport (registreredes rettigheder)
- [ ] ⭐ Cookie-/samtykkebanner (hvis analytics/cookies tilføjes)

### Email
- [ ] Dedikeret domæne-mailadresse i stedet for privat hotmail
- [ ] ⭐ Flyt til transaktions-mailudbyder (Postmark / Brevo / Mailgun)
- [ ] ⭐ **SPF + DKIM + DMARC** på afsenderdomæne - dette er den egentlige fix for spam
- [ ] Ret template-routing (forkert skabelon sendes i visse scenarier)
- [ ] ⭐ Testmatrix over alle transaktionsmails (invitation, nulstilling, aktivering, booking)
- [ ] ⭐ Log hver afsendelse + håndter bounces

### Observability & drift
- [ ] Struktureret backend-logging (Serilog), korrelations-id'er
- [ ] Log alle fejl (fil/store), log succesfulde mailafsendelser
- [ ] ⭐ Udvid Sentry til .NET-backend (frontend har allerede Sentry)
- [ ] ⭐ Audit-log (hvem bookede/aflyste/ændrede hvad)
- [ ] ⭐ DB-monitorering (langsomme queries, forbindelser) + health-check endpoint
- [ ] ⭐ Uptime-overvågning + alarmering (BetterStack / UptimeRobot)

### Miljøer, test & data
- [ ] Fungerende QA/staging-miljø adskilt fra produktion, med seed-data
- [ ] ⭐ CI-pipeline (build + test + migrationer)
- [ ] ⭐ Automatiske tests - som minimum E2E (Playwright): signup → book → aflys → invitér
- [ ] Manuel test / QA-tjekliste
- [ ] ⭐ DB-backup + **testet gendannelse**
- [ ] ⭐ Migrations-/rollback-strategi

### Security 🔒
- [x] ⭐ Ryd `npm audit` (13 sårbarheder, heraf 1 kritisk) - 0 tilbage; versioner pinnet eksakt + `save-exact` i `.npmrc`
- [ ] ⭐ Fjern `laundrybook.dump` fra repo-mappen + tilføj til `.gitignore` (DB-dump må ikke committes)
- [ ] ⭐ Gennemgå server-side autorisation (en beboer må aldrig kunne nå en anden forenings data)
- [ ] ⭐ Rate-limiting på login/invitation/nulstilling/QR + brute-force-lockout
- [ ] ⭐ Security headers / HSTS, CORS, secrets-hygiejne, token-udløb

### Betaling / abonnement
- [ ] Beslut prismodel (se afsnit nedenfor)
- [ ] Stripe (kort + gentagende) **og** årlig faktura/bankoverførsel (bestyrelser betaler sjældent med kort)
- [ ] ⭐ EAN/e-faktura hvis alment byggeri bliver målgruppe
- [ ] ⭐ 25% moms, kvitteringer, dunning/fejlbetaling

### Infra
- [ ] Bekræft **EU-dataregion** (GDPR) hos Render
- [ ] Managed Postgres med backups, custom domæne + SSL
- [ ] Overvej Hetzner/andet **senere** - omkostningsoptimering, ikke en launch-blocker

### Marketing / offentlig side
- [ ] Ret `index.html` title/meta/OG + favicon
- [ ] ⭐ Offentlig **prisside** (begge konkurrenter viser priser - skjult pris = "dyrt")
- [ ] ⭐ Privatlivsvenlig analytics (Plausible / Umami), sitemap/SEO

---

## Differentiering (hvor vi faktisk skiller os ud)

- [ ] **Multi-ejendom / administrator-hierarki.** OrgAdmin → ejendomsadmin → beboer + flere
      vaskerum pr. ejendom. vaskerum.dk topper ved ét rum / 30 brugere. Ram administratorer og
      større foreninger, der styrer flere bygninger fra ét login.
- [ ] **Privatliv som feature.** Anonym / lejlighedsnr / fuldt navn-synlighed - et GDPR-salgsargument
      ingen af konkurrenterne fremhæver. "Book uden at naboerne ser dit navn."
- [ ] **Booking-fleksibilitet** - helt lokale *eller* specifik maskine (vaskerum.dk er kun maskine).
- [ ] **No-show-loopet:** påmindelse → **ét-tryks aflysning fra notifikationen** → frigivet tid
      **tilbydes automatisk til ventelisten**. Samlet = færre spildte tider.
- [ ] **Design/UX** er foran begge - før det som argument.

---

## Roadmap (efter launch)

**Parity (byg snart, så vi ikke er bagud vaskekælder.dk)**
- [ ] Venteliste + notifikation når en tid bliver ledig (mail/SMS)
- [ ] Påmindelse når booking er på vej / slutter, med hurtig-aflys hvis den ikke bruges
- [ ] Forbrugsstatistik til generalforsamlingen (eksporterbar)

**Så differentierer vi**
- [ ] No-show-loopet (påmindelse → ét-tryks aflys → auto-tilbud til venteliste)
- [ ] Opslagstavle: bestyrelsen kommunikerer regler/noter til beboere (ingen af konkurrenterne nævner beboer-kommunikation)
- [ ] Marker maskine "ude af drift"
- [ ] iCal-eksport af egne bookinger
- [ ] PWA push-notifikationer

---

## Prismodel (dansk kontekst)

- Bestyrelser betaler sjældent med kort → understøt **både** Stripe (kort/recurring) og **årlig
  faktura/bankoverførsel**; **EAN/e-faktura** hvis alment byggeri.
- Model: **pr. lejlighed/md** (som vaskekælder, prisen skalerer med værdi) virker mere fair for
  små foreninger end fast pris pr. vaskerum. Overvej gratis prøveperiode som vaskerum.dk.
- Husk **25% moms** og kvitteringer.
