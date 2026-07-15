import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PublicLayout } from './PublicLayout'
import { colors } from '../../shared/theme'
import { IconCheck } from '../../shared/icons'

const CONTACT_EMAIL = 'sigurd-horsholt@hotmail.com'
const STORY_KEYS = ['story1', 'story2', 'story3'] as const
const HONEST_KEYS = ['honest1', 'honest2', 'honest3'] as const
const FACT_KEYS = ['factLocation', 'factBrowser', 'factAudience', 'factPrice'] as const

export function AboutPage() {
  const { t } = useTranslation()

  return (
    <PublicLayout>

      {/* Hero */}
      <section style={{ backgroundColor: '#f7f3ea' }}>
        <div className="container-xl px-4 text-center" style={{ paddingTop: '4.5rem', paddingBottom: '3.5rem' }}>
          <span className="d-inline-block mb-3 px-3 py-1 rounded-pill"
            style={{ backgroundColor: colors.primaryLight, color: colors.primary, fontSize: '0.78rem', fontWeight: 600 }}>
            {t('public.about.eyebrow')}
          </span>
          <h1 className="fw-bold mb-3"
            style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', lineHeight: 1.15, letterSpacing: '-0.6px', color: colors.textPrimary }}>
            {t('public.about.title')}
          </h1>
          <p className="mx-auto mb-0" style={{ color: colors.textSecondary, fontSize: '1.05rem', lineHeight: 1.7, maxWidth: 560 }}>
            {t('public.about.lead')}
          </p>
        </div>
      </section>

      {/* Story + facts */}
      <section style={{ backgroundColor: '#fff' }}>
        <div className="container-xl px-4" style={{ paddingTop: '3.5rem', paddingBottom: '3.5rem' }}>
          <div className="row justify-content-center g-5">
            <div className="col-12 col-lg-7">
              <h2 className="fw-bold mb-3" style={{ fontSize: '1.5rem', color: colors.textPrimary, letterSpacing: '-0.3px' }}>
                {t('public.about.storyTitle')}
              </h2>
              {STORY_KEYS.map(k => (
                <p key={k} className="mb-3" style={{ color: colors.textSecondary, fontSize: '1.02rem', lineHeight: 1.75 }}>
                  {t(`public.about.${k}`)}
                </p>
              ))}
            </div>
            <div className="col-12 col-lg-4">
              <div className="rounded-3 p-4" style={{ backgroundColor: colors.bgPage, border: `1px solid ${colors.borderDefault}` }}>
                <h3 className="fw-semibold mb-3" style={{ fontSize: '0.8rem', color: colors.textMuted, letterSpacing: '0.09em', textTransform: 'uppercase' }}>
                  {t('public.about.factsTitle')}
                </h3>
                <ul className="list-unstyled mb-0 d-flex flex-column gap-2">
                  {FACT_KEYS.map(k => (
                    <li key={k} className="d-flex align-items-start gap-2" style={{ color: colors.textSecondary, fontSize: '0.92rem', lineHeight: 1.5 }}>
                      <span style={{ flexShrink: 0, marginTop: 2 }}><IconCheck size={15} color={colors.primary} strokeWidth={2.5} /></span>
                      {t(`public.about.${k}`)}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Honesty + name */}
      <section style={{ backgroundColor: colors.primaryLight }}>
        <div className="container-xl px-4" style={{ paddingTop: '3.5rem', paddingBottom: '3.5rem' }}>
          <div className="row justify-content-center">
            <div className="col-12 col-lg-8">
              <h2 className="fw-bold mb-3" style={{ fontSize: '1.5rem', color: colors.textPrimary, letterSpacing: '-0.3px' }}>
                {t('public.about.honestTitle')}
              </h2>
              {HONEST_KEYS.map((k, i) => (
                <p key={k} className={i === HONEST_KEYS.length - 1 ? 'mb-0' : 'mb-3'} style={{ color: colors.textSecondary, fontSize: '1.02rem', lineHeight: 1.75 }}>
                  {t(`public.about.${k}`)}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ backgroundColor: colors.primary }}>
        <div className="container-xl px-4 py-5 text-center text-white">
          <h2 className="fw-bold mb-3" style={{ fontSize: 'clamp(1.4rem, 3vw, 1.9rem)', letterSpacing: '-0.3px' }}>
            {t('public.about.ctaTitle')}
          </h2>
          <p className="mx-auto mb-4" style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1rem', maxWidth: 520 }}>
            {t('public.about.ctaBody')}
          </p>
          <div className="d-flex flex-column flex-sm-row justify-content-center gap-3">
            <Link to="/demo"
              className="btn btn-lg fw-bold text-decoration-none"
              style={{ backgroundColor: '#fff', color: colors.primary, borderRadius: 10, padding: '12px 28px', fontSize: '1rem', border: 'none' }}>
              {t('public.about.tryDemo')}
            </Link>
            <Link to="/signup"
              className="btn btn-lg fw-semibold text-decoration-none"
              style={{ backgroundColor: 'transparent', color: '#fff', borderRadius: 10, padding: '12px 28px', fontSize: '1rem', border: '1px solid rgba(255,255,255,0.5)' }}>
              {t('public.about.getStarted')}
            </Link>
            <a href={`mailto:${CONTACT_EMAIL}`}
              className="btn btn-lg fw-semibold text-decoration-none"
              style={{ backgroundColor: 'transparent', color: '#fff', borderRadius: 10, padding: '12px 28px', fontSize: '1rem', border: '1px solid rgba(255,255,255,0.5)' }}>
              {t('public.about.contact')}
            </a>
          </div>
        </div>
      </section>

    </PublicLayout>
  )
}
