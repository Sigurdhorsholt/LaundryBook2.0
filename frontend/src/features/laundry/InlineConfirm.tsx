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
  width: 28, height: 28, borderRadius: '50%', padding: 0,
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', flexShrink: 0,
}

/** Compact ✗ / ✓ pair that rolls out in place of the clicked action button. */
export function InlineConfirm({ variant, loading, onConfirm, onDismiss }: InlineConfirmProps) {
  return (
    <span
      onClick={(e) => e.stopPropagation()}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
    >
      <button
        aria-label="Fortryd"
        disabled={loading}
        onClick={onDismiss}
        style={{
          ...roundBtn,
          border: `1px solid ${colors.borderStrong}`,
          backgroundColor: colors.bgCard,
          animation: 'confirm-roll-in 0.2s ease-out both',
        }}
      >
        <IconX size={13} color={colors.textSecondary} strokeWidth={2.2} />
      </button>
      <button
        aria-label={variant === 'book' ? 'Bekræft booking' : 'Bekræft aflysning'}
        disabled={loading}
        onClick={onConfirm}
        style={{
          ...roundBtn,
          border: 'none',
          backgroundColor: variant === 'book' ? colors.primary : colors.dangerText,
          animation: 'confirm-roll-in 0.2s ease-out 0.06s both',
        }}
      >
        {loading ? (
          <span
            className="spinner-border spinner-border-sm"
            style={{ width: 13, height: 13, borderWidth: 2, color: colors.bgCard }}
          />
        ) : (
          <IconCheck size={14} color={colors.bgCard} strokeWidth={2.4} />
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
  if (error) {
    return <div style={{ fontSize: '0.76rem', color: colors.dangerText, ...style }}>{error}</div>
  }
  const mu = pending.minutesUntil
  if (pending.type === 'cancel' && mu !== undefined && mu >= 0 && mu < 240) {
    const hours = Math.floor(mu / 60)
    return (
      <div style={{ fontSize: '0.76rem', color: colors.warningText, ...style }}>
        {mu < 60
          ? `Bookingen starter om ${mu} minutter.`
          : `Bookingen starter om ${hours} time${hours === 1 ? '' : 'r'}.`}
      </div>
    )
  }
  return null
}
