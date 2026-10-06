import { useTranslation } from 'react-i18next'
import { BrandLogo } from './BrandLogo'
import { colors } from './theme'

// Rendered by the root error boundary, outside the router and store, so it only uses plain links.
export function ErrorFallback() {
  const { t } = useTranslation()
  return (
    <div className="d-flex justify-content-center align-items-center px-3" style={{ minHeight: '100vh', backgroundColor: colors.bgPage }}>
      <div className="bg-white rounded-3 p-4 p-md-5 text-center" style={{ width: '100%', maxWidth: 420, border: `1px solid ${colors.borderDefault}` }}>
        <BrandLogo size={28} />
        <h1 className="fw-bold mt-3 mb-2" style={{ fontSize: '1.3rem', color: colors.textPrimary }}>
          {t('errorBoundary.title')}
        </h1>
        <p style={{ color: colors.textSecondary, fontSize: '0.9rem' }}>{t('errorBoundary.body')}</p>
        <div className="d-flex justify-content-center gap-2 mt-3">
          <button type="button" className="btn btn-primary fw-semibold" onClick={() => window.location.reload()}>
            {t('errorBoundary.reload')}
          </button>
          <a href="/" className="btn btn-outline-secondary">{t('errorBoundary.home')}</a>
        </div>
      </div>
    </div>
  )
}
