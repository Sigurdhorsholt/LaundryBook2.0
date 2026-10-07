import { useTranslation, Trans } from 'react-i18next'
import type { PendingAction } from './types'
import { formatDateFull } from '../../shared/utils/dateUtils'
import { colors } from '../../shared/theme'
import { TAP_TARGET_PX } from './constants'

interface InlineConfirmPanelProps {
  pending: PendingAction
  loading: boolean
  error: string | null
  // Bookings in use before this one, so the prompt can say where the resident ends up
  usage?: { used: number; max: number }
  onConfirm: () => void
  onDismiss: () => void
  style?: React.CSSProperties
}

export function InlineConfirmPanel({ pending, loading, error, usage, onConfirm, onDismiss, style }: InlineConfirmPanelProps) {
  const { t } = useTranslation()
  const isBook = pending.type === 'book'
  const values = { slotTime: pending.slotTime, dateText: formatDateFull(pending.date), machineName: pending.machineName }
  const promptKey = isBook
    ? (pending.machineName ? 'laundry.confirmBooking.promptBookWithMachine' : 'laundry.confirmBooking.promptBook')
    : (pending.machineName ? 'laundry.confirmBooking.promptCancelWithMachine' : 'laundry.confirmBooking.promptCancel')

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => { if (e.key === 'Escape' && !loading) onDismiss() }}
      style={style}
    >
      <p style={{ margin: 0, fontSize: '0.88rem', color: colors.textPrimary }}>
        <Trans i18nKey={promptKey} values={values} components={{ s: <strong /> }} />
        {isBook && usage && ` ${t('laundry.inlineConfirm.usageAfter', { used: usage.used + 1, max: usage.max })}`}
      </p>
      <ConfirmMessage pending={pending} error={error} style={{ marginTop: 4 }} />
      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        <button
          type="button"
          className="btn btn-outline-secondary"
          // Focus lands here because the button that opened the panel is gone; dismissing is the safe default
          autoFocus
          disabled={loading}
          onClick={onDismiss}
          // Inline colours: Bootstrap's focus state would otherwise turn the text white on this white button
          style={{ flex: 1, minHeight: TAP_TARGET_PX, borderRadius: 10, fontSize: '0.88rem', fontWeight: 600, backgroundColor: colors.bgCard, color: colors.textPrimary, borderColor: colors.borderStrong }}
        >
          {t('laundry.actions.dismiss')}
        </button>
        <button
          type="button"
          className={`btn ${isBook ? 'btn-primary' : 'btn-danger'}`}
          disabled={loading}
          onClick={onConfirm}
          style={{ flex: 2, minHeight: TAP_TARGET_PX, borderRadius: 10, fontSize: '0.88rem', fontWeight: 700 }}
        >
          {loading
            ? <span className="spinner-border spinner-border-sm" />
            : isBook ? t('laundry.actions.bookTime') : t('laundry.actions.cancelTime')}
        </button>
      </div>
    </div>
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
    return <div role="alert" style={{ fontSize: '0.8rem', color: colors.dangerText, ...style }}>{error}</div>
  }
  const mu = pending.minutesUntil
  if (pending.type === 'cancel' && mu !== undefined && mu >= 0 && mu < 240) {
    return (
      <div style={{ fontSize: '0.8rem', color: colors.warningText, ...style }}>
        {mu < 60
          ? t('laundry.confirmBooking.warningMinutes', { count: mu })
          : t('laundry.confirmBooking.warningHours', { count: Math.floor(mu / 60) })}
      </div>
    )
  }
  return null
}
