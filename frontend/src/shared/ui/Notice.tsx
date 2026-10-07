import { useTranslation } from 'react-i18next'
import { colors } from '../theme'
import { IconX } from '../icons'

export function Notice({ children, onDismiss, tone = 'success' }: { children: React.ReactNode; onDismiss: () => void; tone?: 'success' | 'danger' }) {
  const { t } = useTranslation()
  const palette = tone === 'danger'
    ? { bg: colors.dangerBg, border: colors.dangerBorder, text: colors.dangerText }
    : { bg: colors.successBg, border: colors.successBorder, text: colors.successText }
  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      className="d-flex align-items-start justify-content-between gap-2 mb-3"
      style={{
        backgroundColor: palette.bg,
        border: `1px solid ${palette.border}`,
        color: palette.text,
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
        style={{ color: palette.text }}
      >
        <IconX size={14} />
      </button>
    </div>
  )
}
