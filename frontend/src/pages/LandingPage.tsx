import { Navigate, Link } from 'react-router-dom'
import { useMeQuery } from '../features/auth/authApi'
import { useModal } from '../shared/modals/useModal'
import { PublicLayout } from './public/PublicLayout'
import { PhotoPlaceholder } from './public/PhotoPlaceholder'
import { colors } from '../shared/theme'
import { IconCheck } from '../shared/icons'

export function LandingPage() {
  const { openModal } = useModal()
  const { data: user, isLoading } = useMeQuery()

  if (isLoading) return null
  if (user) return <Navigate to="/dashboard" replace />

  return (
    <PublicLayout>

      {/* ── WarmSage hero ── */}
      <section className="w-100 position-relative overflow-hidden" style={{ backgroundColor: '#f7f3ea' }}>
        <div className="position-absolute" style={{ top: -120, right: -120, width: 380, height: 380, borderRadius: '50%', background: 'radial-gradient(circle, rgba(61,122,92,0.14), transparent 70%)', pointerEvents: 'none' }} />
        <div className="position-absolute" style={{ bottom: -140, left: -100, width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, rgba(13,59,122,0.09), transparent 70%)', pointerEvents: 'none' }} />
        <div className="container-xl px-4 position-relative" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
          <div className="row align-items-center g-5">
            <div className="col-12 col-lg-6">
              <span className="d-inline-flex align-items-center gap-2 mb-3 px-3 py-1 rounded-pill"
                style={{ backgroundColor: '#fff', border: `1px solid ${colors.borderDefault}`, fontSize: '0.78rem', fontWeight: 600, color: colors.textSecondary }}>
                <span className="rounded-circle" style={{ width: 7, height: 7, backgroundColor: colors.primary }} />
                Til danske ejerforeninger
              </span>
              <h1 className="fw-bold mb-4"
                style={{ fontSize: 'clamp(2.2rem, 5.5vw, 3.75rem)', lineHeight: 1.1, letterSpacing: '-0.8px', color: colors.textPrimary }}>
                Et vaskerum uden <span style={{ color: colors.primary }}>drama</span>.
              </h1>
              <p className="mb-4" style={{ color: colors.textSecondary, fontSize: 'clamp(1rem, 1.8vw, 1.15rem)', lineHeight: 1.7, maxWidth: 460 }}>
                LaundryBook er det rolige sted hvor jeres beboere booker vasketider og bestyrelsen holder styr på det hele. Ingen overklistrede sedler. Ingen nøgler der forsvinder.
              </p>
              <div className="d-flex flex-column flex-sm-row gap-3 mb-4">
                <Link to="/demo" className="btn btn-lg fw-bold text-decoration-none d-inline-flex align-items-center justify-content-center"
                  style={{ backgroundColor: colors.primary, color: '#fff', borderRadius: 10, padding: '12px 28px', fontSize: '1rem', border: 'none', boxShadow: '0 6px 20px rgba(61,122,92,0.28)' }}>
                  Prøv demo
                </Link>
                <button className="btn btn-lg fw-semibold"
                  style={{ backgroundColor: '#fff', color: colors.textPrimary, borderRadius: 10, padding: '12px 28px', fontSize: '1rem', border: `1px solid ${colors.borderStrong}` }}
                  onClick={() => openModal('login')}>
                  Log ind
                </button>
              </div>
              <p className="mb-0" style={{ color: colors.textMuted, fontSize: '0.85rem' }}>
                Prøv demoen — ingen oprettelse nødvendig.
              </p>
            </div>
            <div className="col-12 col-lg-6">
              <div className="position-relative">
                <div className="rounded-4 overflow-hidden"
                  style={{ border: `1px solid ${colors.borderDefault}`, boxShadow: '0 24px 60px rgba(10,25,41,0.18)' }}>
                  <PhotoPlaceholder scene="building" aspect="5/4" />
                </div>
                <div className="position-absolute bg-white rounded-3 p-3 d-none d-md-block"
                  style={{ bottom: -22, left: -22, boxShadow: '0 14px 40px rgba(10,25,41,0.16)', border: `1px solid ${colors.borderDefault}`, width: 220 }}>
                  <p className="mb-1" style={{ fontSize: '0.7rem', fontWeight: 700, color: colors.successText, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Din booking
                  </p>
                  <p className="mb-0 fw-semibold" style={{ fontSize: '0.88rem', color: colors.textPrimary, lineHeight: 1.4 }}>
                    Onsdag 10:00 – 11:30<br />
                    <span className="fw-normal" style={{ color: colors.textSecondary, fontSize: '0.82rem' }}>Vaskerum 1</span>
                  </p>
                </div>
                <div className="position-absolute bg-white rounded-3 px-3 py-2 d-none d-md-flex align-items-center gap-2"
                  style={{ top: -18, right: -18, boxShadow: '0 14px 40px rgba(10,25,41,0.16)', border: `1px solid ${colors.borderDefault}` }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: colors.dotFree, flexShrink: 0 }} />
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: colors.textPrimary }}>6 ledige tider i dag</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Value props ── */}
      <section style={{ backgroundColor: colors.bgPage }}>
        <div className="container-xl px-4" style={{ paddingTop: '5rem', paddingBottom: '5rem' }}>
          <div className="row justify-content-center mb-5">
            <div className="col-12 col-lg-8 text-center">
              <span className="d-inline-block mb-3 px-3 py-1 rounded-pill"
                style={{ backgroundColor: colors.primaryLight, color: colors.primary, fontSize: '0.78rem', fontWeight: 600 }}>
                Lavet til jeres forening
              </span>
              <h2 className="fw-bold mb-3"
                style={{ fontSize: 'clamp(1.7rem, 3.5vw, 2.4rem)', letterSpacing: '-0.5px', color: colors.textPrimary, lineHeight: 1.2 }}>
                Mindre besvær.<br />Bedre naboskab.
              </h2>
              <p className="mx-auto mb-0" style={{ color: colors.textSecondary, fontSize: '1.05rem', lineHeight: 1.6, maxWidth: 560 }}>
                Bookingsedlen på væggen i kælderen er historie. LaundryBook giver jeres beboere et roligt sted at finde en ledig tid — og jer i bestyrelsen et klart overblik.
              </p>
            </div>
          </div>

          <div className="row g-4 g-lg-5 align-items-center mb-5 pb-3">
            <div className="col-12 col-lg-6">
              <div className="rounded-4 overflow-hidden" style={{ border: `1px solid ${colors.borderDefault}`, boxShadow: '0 8px 28px rgba(13,59,122,0.08)' }}>
                <PhotoPlaceholder scene="laundry" aspect="4/3" />
              </div>
            </div>
            <div className="col-12 col-lg-6">
              <p className="fw-semibold mb-2" style={{ color: colors.primary, fontSize: '0.85rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>For beboeren</p>
              <h3 className="fw-bold mb-3" style={{ fontSize: '1.8rem', color: colors.textPrimary, letterSpacing: '-0.3px' }}>
                Book en vask på vej hjem fra arbejde
              </h3>
              <p style={{ color: colors.textSecondary, fontSize: '1rem', lineHeight: 1.7, maxWidth: 520 }}>
                Se hvilke tider der er ledige i dag, i morgen, eller senere på ugen. Book med ét tryk.
              </p>
              <ul className="list-unstyled mt-3">
                {['Ledige tider vist med farvekoder', 'Aflys direkte i appen hvis planer ændrer sig', 'Virker på mobil, tablet og computer'].map(t => (
                  <li key={t} className="d-flex align-items-start gap-2 mb-2" style={{ color: colors.textPrimary, fontSize: '0.95rem' }}>
                    <span className="flex-shrink-0" style={{ marginTop: 2 }}><IconCheck size={16} color={colors.primary} strokeWidth={2.5} /></span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="row g-4 g-lg-5 align-items-center flex-lg-row-reverse">
            <div className="col-12 col-lg-6">
              <div className="rounded-4 overflow-hidden" style={{ border: `1px solid ${colors.borderDefault}`, boxShadow: '0 8px 28px rgba(13,59,122,0.08)' }}>
                <PhotoPlaceholder scene="hallway" aspect="4/3" />
              </div>
            </div>
            <div className="col-12 col-lg-6">
              <p className="fw-semibold mb-2" style={{ color: colors.primary, fontSize: '0.85rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>For bestyrelsen</p>
              <h3 className="fw-bold mb-3" style={{ fontSize: '1.8rem', color: colors.textPrimary, letterSpacing: '-0.3px' }}>
                Ro i administrationen
              </h3>
              <p style={{ color: colors.textSecondary, fontSize: '1rem', lineHeight: 1.7, maxWidth: 520 }}>
                Opret vaskerum, definér tidspladser og tilføj beboere. Én gang. Derefter passer systemet sig selv — og I kan fokusere på det, der faktisk kræver jeres tid.
              </p>
              <ul className="list-unstyled mt-3">
                {['Tilføj eller fjern beboere ved indflytning', 'Se hvem der har booket hvornår', 'Sæt bookingregler og synlighed for foreningen'].map(t => (
                  <li key={t} className="d-flex align-items-start gap-2 mb-2" style={{ color: colors.textPrimary, fontSize: '0.95rem' }}>
                    <span className="flex-shrink-0" style={{ marginTop: 2 }}><IconCheck size={16} color={colors.primary} strokeWidth={2.5} /></span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ backgroundColor: colors.primary }}>
        <div className="container-xl px-4 py-5">
          <div className="row justify-content-center">
            <div className="col-12 col-lg-7 text-center text-white">
              <h2 className="fw-bold mb-3" style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', letterSpacing: '-0.3px' }}>
                Klar til at gøre vaskerummet nemmere?
              </h2>
              <p className="mb-4" style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1rem' }}>
                Prøv en demo eller log ind for at komme i gang med jeres forening.
              </p>
              <div className="d-flex flex-column flex-sm-row justify-content-center gap-3">
                <Link to="/demo" className="btn btn-lg fw-bold px-4 text-decoration-none d-inline-flex align-items-center justify-content-center"
                  style={{ backgroundColor: '#fff', color: colors.primary, borderRadius: 10, fontSize: '1rem', border: 'none' }}>
                  Prøv demo
                </Link>
                <button className="btn btn-lg fw-semibold px-4"
                  style={{ backgroundColor: 'transparent', color: '#fff', borderRadius: 10, fontSize: '1rem', border: '1px solid rgba(255,255,255,0.4)' }}
                  onClick={() => openModal('login')}>
                  Log ind
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

    </PublicLayout>
  )
}
