import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PublicLayout } from './PublicLayout'
import { GetStartedSteps } from './GetStartedSteps'
import { useModal } from '../../shared/modals/useModal'
import { colors } from '../../shared/theme'
import { IconCheck } from '../../shared/icons'

const TRUST_KEYS = ['support', 'browser', 'invite'] as const

export function GetStartedPage() {
  const { openModal } = useModal()
  const { t } = useTranslation()

  return (
    <PublicLayout>

      {/* Hero */}
      <section style={{ backgroundColor: '#f7f3ea' }}>
        <div className="container-xl px-4 text-center" style={{ paddingTop: '4.5rem', paddingBottom: '3.5rem' }}>
          <span className="d-inline-block mb-3 px-3 py-1 rounded-pill"
            style={{ backgroundColor: colors.primaryLight, color: colors.primary, fontSize: '0.78rem', fontWeight: 600 }}>
            {t('public.getStarted.eyebrow')}
          </span>
          <h1 className="fw-bold mb-3"
            style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', lineHeight: 1.15, letterSpacing: '-0.6px', color: colors.textPrimary }}>
            {t('public.getStarted.title')}
          </h1>
          <p className="mx-auto mb-4" style={{ color: colors.textSecondary, fontSize: '1.05rem', lineHeight: 1.7, maxWidth: 520 }}>
            {t('public.getStarted.subtitle')}
          </p>
          <div className="d-flex flex-column flex-sm-row justify-content-center gap-3">
            <Link
              to="/signup"
              className="btn btn-lg fw-bold text-decoration-none d-inline-flex align-items-center justify-content-center"
              style={{ backgroundColor: colors.primary, color: '#fff', borderRadius: 10, padding: '12px 32px', fontSize: '1rem', border: 'none', boxShadow: '0 6px 20px rgba(61,122,92,0.28)' }}
            >
              {t('public.getStarted.createAssociation')}
            </Link>
            <Link to="/demo"
              className="btn btn-lg fw-semibold text-decoration-none d-inline-flex align-items-center justify-content-center"
              style={{ backgroundColor: '#fff', color: colors.textPrimary, borderRadius: 10, padding: '12px 28px', fontSize: '1rem', border: `1px solid ${colors.borderStrong}` }}>
              {t('public.getStarted.tryDemoFirst')}
            </Link>
          </div>
          <p className="mt-3 mb-0" style={{ color: colors.textMuted, fontSize: '0.82rem' }}>
            {t('public.getStarted.alreadyHaveAccount')}{' '}
            <button className="btn btn-link p-0 align-baseline"
              style={{ color: colors.primary, fontSize: '0.82rem', textDecoration: 'underline' }}
              onClick={() => openModal('login')}>
              {t('public.getStarted.loginHere')}
            </button>
          </p>
        </div>
      </section>

      {/* Trust strip */}
      <section style={{ backgroundColor: '#fff', borderBottom: `1px solid ${colors.borderDefault}` }}>
        <div className="container-xl px-4 py-3">
          <div className="d-flex flex-wrap justify-content-center gap-3 gap-md-5">
            {TRUST_KEYS.map(k => (
              <span key={k} className="d-flex align-items-center gap-2" style={{ color: colors.textSecondary, fontSize: '0.85rem' }}>
                <IconCheck size={14} color={colors.primary} strokeWidth={2.5} />
                {t(`public.getStarted.trust.${k}`)}
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
            {t('public.getStarted.ctaTitle')}
          </h2>
          <p className="mb-4" style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1rem' }}>
            {t('public.getStarted.ctaSubtitle')}
          </p>
          <Link
            to="/signup"
            className="btn btn-lg fw-bold text-decoration-none d-inline-flex align-items-center"
            style={{ backgroundColor: '#fff', color: colors.primary, borderRadius: 10, padding: '12px 32px', fontSize: '1rem', border: 'none' }}
          >
            {t('public.getStarted.createAssociation')}
          </Link>
        </div>
      </section>

    </PublicLayout>
  )
}
