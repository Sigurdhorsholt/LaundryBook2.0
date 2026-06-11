import { Link } from 'react-router-dom'
import { PublicLayout } from './PublicLayout'
import { GetStartedSteps } from './GetStartedSteps'
import { useModal } from '../../shared/modals/useModal'
import { colors } from '../../shared/theme'
import { IconCheck } from '../../shared/icons'

const TRUST = [
  'Dansk support via mail',
  'Virker i browseren — ingen app at installere',
  'Beboere inviteres med et link',
]

export function GetStartedPage() {
  const { openModal } = useModal()

  return (
    <PublicLayout>

      {/* Hero */}
      <section style={{ backgroundColor: '#f7f3ea' }}>
        <div className="container-xl px-4 text-center" style={{ paddingTop: '4.5rem', paddingBottom: '3.5rem' }}>
          <span className="d-inline-block mb-3 px-3 py-1 rounded-pill"
            style={{ backgroundColor: colors.primaryLight, color: colors.primary, fontSize: '0.78rem', fontWeight: 600 }}>
            Til danske ejerforeninger
          </span>
          <h1 className="fw-bold mb-3"
            style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', lineHeight: 1.15, letterSpacing: '-0.6px', color: colors.textPrimary }}>
            Få jeres forening i gang
          </h1>
          <p className="mx-auto mb-4" style={{ color: colors.textSecondary, fontSize: '1.05rem', lineHeight: 1.7, maxWidth: 520 }}>
            Opret jeres forening med det samme. Vi aktiverer den, så snart vi har set den, og I kan sætte vaskerum og beboere op.
          </p>
          <div className="d-flex flex-column flex-sm-row justify-content-center gap-3">
            <Link
              to="/signup"
              className="btn btn-lg fw-bold text-decoration-none d-inline-flex align-items-center justify-content-center"
              style={{ backgroundColor: colors.primary, color: '#fff', borderRadius: 10, padding: '12px 32px', fontSize: '1rem', border: 'none', boxShadow: '0 6px 20px rgba(61,122,92,0.28)' }}
            >
              Opret forening
            </Link>
            <Link to="/demo"
              className="btn btn-lg fw-semibold text-decoration-none d-inline-flex align-items-center justify-content-center"
              style={{ backgroundColor: '#fff', color: colors.textPrimary, borderRadius: 10, padding: '12px 28px', fontSize: '1rem', border: `1px solid ${colors.borderStrong}` }}>
              Prøv demo først
            </Link>
          </div>
          <p className="mt-3 mb-0" style={{ color: colors.textMuted, fontSize: '0.82rem' }}>
            Har du allerede en konto?{' '}
            <button className="btn btn-link p-0 align-baseline"
              style={{ color: colors.primary, fontSize: '0.82rem', textDecoration: 'underline' }}
              onClick={() => openModal('login')}>
              Log ind her
            </button>
          </p>
        </div>
      </section>

      {/* Trust strip */}
      <section style={{ backgroundColor: '#fff', borderBottom: `1px solid ${colors.borderDefault}` }}>
        <div className="container-xl px-4 py-3">
          <div className="d-flex flex-wrap justify-content-center gap-3 gap-md-5">
            {TRUST.map(t => (
              <span key={t} className="d-flex align-items-center gap-2" style={{ color: colors.textSecondary, fontSize: '0.85rem' }}>
                <IconCheck size={14} color={colors.primary} strokeWidth={2.5} />
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      <GetStartedSteps />

      {/* Bottom CTA */}
      <section style={{ backgroundColor: colors.primary }}>
        <div className="container-xl px-4 py-5 text-center text-white">
          <h2 className="fw-bold mb-3" style={{ fontSize: 'clamp(1.4rem, 3vw, 1.9rem)', letterSpacing: '-0.3px' }}>
            Klar til at slippe for bookingproblemer?
          </h2>
          <p className="mb-4" style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1rem' }}>
            Opret jeres forening — det tager et øjeblik.
          </p>
          <Link
            to="/signup"
            className="btn btn-lg fw-bold text-decoration-none d-inline-flex align-items-center"
            style={{ backgroundColor: '#fff', color: colors.primary, borderRadius: 10, padding: '12px 32px', fontSize: '1rem', border: 'none' }}
          >
            Opret forening
          </Link>
        </div>
      </section>

    </PublicLayout>
  )
}
