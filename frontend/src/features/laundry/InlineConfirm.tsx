import { useTranslation } from 'react-i18next'
import type { PendingAction } from './types'
import { colors } from '../../shared/theme'
import { IconCheck, IconX } from '../../shared/icons'

interface InlineConfirmProps {
  variant: 'book' | 'cancel'
  loading: boolean
  onConfirm: () => void
  onDismiss: () => void
}

const roundBtn: React.CSSProperties = {
  width: 34, height: 34, borderRadius: '50%', padding: 0,
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', flexShrink: 0,
}

/** Compact ✗ / ✓ pair that rolls out in place of the clicked action button. */
export function InlineConfirm({ variant, loading, onConfirm, onDismiss }: InlineConfirmProps) {
  const { t } = useTranslation()
  return (
    <span
      onClick={(e) => e.stopPropagation()}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
    >
      <button
        aria-label={t('laundry.actions.dismiss')}
        disabled={loading}
        onClick={onDismiss}
        style={{
          ...roundBtn,
          border: `1px solid ${colors.borderStrong}`,
          backgroundColor: colors.bgCard,
          animation: 'confirm-roll-in 0.2s ease-out both',
        }}
      >
        <IconX size={15} color={colors.textSecondary} strokeWidth={2.2} />
      </button>
      <button
        aria-label={variant === 'book' ? t('laundry.actions.confirmBook') : t('laundry.actions.confirmCancel')}
        disabled={loading}
        onClick={onConfirm}
        style={{
          ...roundBtn,
          border: 'none',
          backgroundColor: variant === 'book' ? colors.primary : colors.dangerText,
          boxShadow: '0 2px 8px rgba(26, 46, 36, 0.25)',
          animation: 'confirm-roll-in 0.2s ease-out 0.06s both',
        }}
      >
        {loading ? (
          <span
            className="spinner-border spinner-border-sm"
            style={{ width: 15, height: 15, borderWidth: 2, color: colors.bgCard }}
          />
        ) : (
          <IconCheck size={16} color={colors.bgCard} strokeWidth={2.4} />
        )}
      </button>
    </span>
  )
}

/** Error or "starts soon" warning line shown under a row while a confirm is armed. */
export function ConfirmMessage({ pending, error, style }: {
  pending: PendingAction
  error: string | null
  style?: React.CSSProperties
}) {
  const { t } = useTranslation()
  if (error) {
    return <div style={{ fontSize: '0.76rem', color: colors.dangerText, ...style }}>{error}</div>
  }
  const mu = pending.minutesUntil
  if (pending.type === 'cancel' && mu !== undefined && mu >= 0 && mu < 240) {
    return (
      <div style={{ fontSize: '0.76rem', color: colors.warningText, ...style }}>
        {mu < 60
          ? t('laundry.confirmBooking.warningMinutes', { count: mu })
          : t('laundry.confirmBooking.warningHours', { count: Math.floor(mu / 60) })}
      </div>
    )
  }
  return null
}
