import { useTranslation } from 'react-i18next'
import { colors } from '../theme'

interface ErrorStateProps {
  title: string
  description?: string
  onRetry: () => void
}

export function ErrorState({ title, description, onRetry }: ErrorStateProps) {
  const { t } = useTranslation()
  return (
    <div role="alert" className="d-flex flex-column align-items-center justify-content-center" style={{ padding: '40px 24px', textAlign: 'center' }}>
      <p className="mb-1 fw-semibold" style={{ color: colors.dangerText, fontSize: '0.95rem' }}>{title}</p>
      {description && (
        <p className="mb-3" style={{ color: colors.textMuted, fontSize: '0.85rem' }}>{description}</p>
      )}
      <button type="button" className="btn btn-outline-secondary btn-sm" onClick={onRetry}>
        {t('common.retry')}
      </button>
    </div>
  )
}
