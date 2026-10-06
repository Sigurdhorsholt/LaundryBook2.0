import { useTranslation } from 'react-i18next'
import { colors } from '../theme'
import { IconX } from '../icons'

export function Notice({ children, onDismiss }: { children: React.ReactNode; onDismiss: () => void }) {
  const { t } = useTranslation()
  return (
    <div
      role="status"
      className="d-flex align-items-start justify-content-between gap-2 mb-3"
      style={{
        backgroundColor: colors.successBg,
        border: `1px solid ${colors.successBorder}`,
        color: colors.successText,
        borderRadius: 10,
        padding: '10px 14px',
        fontSize: '0.85rem',
      }}
    >
      <span>{children}</span>
      <button
        type="button"
        className="btn btn-sm p-0 d-flex"
        onClick={onDismiss}
        aria-label={t('common.close')}
        style={{ color: colors.successText }}
      >
        <IconX size={14} />
      </button>
    </div>
  )
}
