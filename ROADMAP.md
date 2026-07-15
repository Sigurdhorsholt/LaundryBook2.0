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
- [x] ⭐ Registrér samtykke server-side ved oprettelse - `User.TermsAcceptedAt` + `TermsVersion`; register + redeem-invite kræver `AcceptedTerms=true` (valideret) og stempler tidspunkt + `TermsPolicy.CurrentVersion`. Migration `AddUserTermsConsent`.
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
- [x] Ret template-routing - `ForcePasswordReset` sendte invitations-skabelonen; har nu sin egen `AdminPasswordResetEmailTemplate`. Alle 4 scenarier (invitation / gensend / bruger-glemt / admin-nulstil) sender nu korrekt skabelon
- [ ] ⭐ Testmatrix over alle transaktionsmails (invitation, nulstilling, aktivering, booking)
- [x] ⭐ SysAdmin test-mail-værktøj - send hver skabelon (invitation / nulstilling / admin-nulstilling) til valgfri modtager (autofyldt med egen mail) fra SysAdmin-siden
- [ ] ⭐ Log hver afsendelse + håndter bounces

### Observability & drift
- [x] Struktureret backend-logging (Serilog) - konsol + rullende dagsfil (`logs/`), request-logging, `LoggingBehaviour` (kommando + bruger + tid + udfald)
- [x] Log alle fejl (fil/store), log succesfulde mailafsendelser - fil-sink + succes/fejl-log i MailgunEmailService
- [x] ⭐ Udvid Sentry til .NET-backend - `Sentry.AspNetCore`, fanger 500'ere i ExceptionHandlingMiddleware (DSN via `Sentry:Dsn`, tom = slået fra)
- [x] ⭐ Audit-log (hvem bookede/aflyste/ændrede hvad) - `AuditLog`-tabel + EF SaveChanges-interceptor fanger ALLE create/update/delete (bookinger, signups, invitationer, roller, indstillinger, aktivering, lokaler/maskiner/tidspladser) med bruger + tid + felt-diff (jsonb). Migration `AddAuditLog` genereret; kører automatisk ved næste deploy.
- [x] ⭐ Audit-log opbevaring/prune - daglig `AuditLogPruneService` sletter rækker ældre end `Audit:RetentionDays` (default 365)
- [x] ⭐ Audit-log fremviser på SysAdmin-siden - `GET /api/sysadmin/audit-logs` (SysAdmin-only, håndhævet i handler via `IsSysAdminAsync`), pagineret + filtre (objekttype/handling); UI: `AuditLogTable` på SysAdmin-siden
- [ ] ⭐ DB-monitorering (langsomme queries, forbindelser) - `/health` findes allerede
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
- [x] ⭐ Fjern `laundrybook.dump` + tilføj til `.gitignore` (`*.dump/*.sql.gz/*.bak` + `logs/`)
- [ ] 🔒 ⭐ **Roter og fjern committede secrets** i `src/WebApi/appsettings.Development.json` (live DB-password, JWT-nøgle, Mailgun-nøgle ligger i git-historikken) + flyt til env/user-secrets
- [~] ⭐ Ryd backend-NuGet-sårbarheder - `SQLitePCLRaw` fjernet (SQLite udfaset); `Microsoft.OpenApi` 2.0.0 (high, NU1903, transitiv) mangler stadig
- [x] ⭐ Gennemgå server-side autorisation - fuld handler-audit. To huller lukket: (1) `RequireRoleAsync`/`IsSysAdminAsync` ignorerede `membership.IsActive` (deaktiverede medlemmer beholdt adgang) → kræver nu `IsActive`; (2) `ForcePasswordReset` bandt ikke `UserId` til `PropertyId` (confused deputy) → verificerer nu medlemskab. Øvrige property-scoped handlers binder korrekt ressource→forening.
- [x] ⭐ Rate-limiting (per klient-IP via ForwardedHeaders): `auth` 10/min (login, register, redeem-invite, invite-info), `email` 5/min (forgot-password, invitér, gensend, force-reset, test-mail). Adgangskode-brute-force ligger hos Firebase; QR-generering (auth'd admin) ikke begrænset.
- [x] ⭐ Security headers / HSTS - `SecurityHeadersMiddleware` (nosniff, X-Frame-Options DENY, Referrer-Policy, streng CSP `default-src 'none'`, Permissions-Policy; HSTS 1 år uden for dev) + `Server`-header fjernet
- [ ] ⭐ Øvrig sikkerhed: CORS-gennemgang, secrets-hygiejne, token-udløb

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
