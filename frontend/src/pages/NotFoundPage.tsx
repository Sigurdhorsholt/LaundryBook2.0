import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { colors } from '../shared/theme'

export function NotFoundPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <div
      className="d-flex flex-column align-items-center justify-content-center text-center"
      style={{ minHeight: '60vh', padding: '2rem' }}
    >
      {/* The SPA answers unknown URLs with 200, so tell crawlers not to index this soft 404 */}
      <meta name="robots" content="noindex" />
      <p
        className="fw-bold mb-2"
        style={{ fontSize: '4rem', color: colors.borderDefault, lineHeight: 1 }}
      >
        404
      </p>
      <h1
        className="fw-bold mb-3"
        style={{ fontSize: '1.5rem', color: colors.textPrimary }}
      >
        {t('notFound.title')}
      </h1>
      <p className="mb-4" style={{ color: colors.textSecondary, maxWidth: 360 }}>
        {t('notFound.body')}
      </p>
      <button
        className="btn btn-primary px-4"
        style={{ borderRadius: '8px' }}
        onClick={() => navigate('/')}
      >
        {t('notFound.goHome')}
      </button>
    </div>
  )
}
