import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { TimeSlotTemplateDto } from './laundryApi'
import type { GridBooking, PendingAction } from './types'
import { formatTime } from '../../shared/utils/dateUtils'
import { colors } from '../../shared/theme'
import { badge } from './slotBadge'
import { InlineConfirmPanel } from './InlineConfirm'
import { TAP_TARGET_PX } from './constants'

interface Props {
  slot: TimeSlotTemplateDto
  booking: GridBooking | null
  past: boolean
  locked: boolean
  blocked: boolean
  onBook: () => void
  onCancel: () => void
  pending?: PendingAction | null   // armed inline confirm for this slot, matched by the grid
  confirmLoading?: boolean
  confirmError?: string | null
  onConfirm?: () => void
  onDismissConfirm?: () => void
  usage?: { used: number; max: number }
}

export function SlotRow({
  slot, booking, past, locked, blocked, onBook, onCancel,
  pending, confirmLoading, confirmError, onConfirm, onDismissConfirm, usage,
}: Props) {
  const { t } = useTranslation()
  const [hovered, setHovered] = useState(false)

  // Flash only on a change seen while mounted. Starting from the current booking means a row that
  // mounts already booked (switching day) doesn't play the "just booked" animation.
  const isOwn = booking?.isOwn ?? false
  const [prevOwn, setPrevOwn] = useState(isOwn)
  const [flash, setFlash] = useState<'booked' | 'cancelled' | null>(null)
  if (prevOwn !== isOwn) {
    setPrevOwn(isOwn)
    setFlash(isOwn ? 'booked' : booking === null ? 'cancelled' : null)
  }
  const justBooked = flash === 'booked'
  const justCancelled = flash === 'cancelled'

  const timeLabel = `${formatTime(slot.startTime)} – ${formatTime(slot.endTime)}`
  const dimmed = past || locked
  const takenByOther = booking !== null && !booking.isOwn
  const confirming = pending != null && !!onConfirm && !!onDismissConfirm
  const isClickable = !past && !locked && booking === null && !blocked && !confirming

  const rowBg =
    (justBooked || booking?.isOwn)              ? colors.slotOwnBg :
    takenByOther                                ? colors.slotTakenBg :
    (confirming && pending?.type === 'book')    ? colors.primaryLight :
    (hovered && isClickable)                    ? colors.primaryLighter :
                                                  colors.bgCard

  const animationStyle: React.CSSProperties = justBooked
    ? { animation: 'slot-booked 0.45s ease-out' }
    : justCancelled
      ? { animation: 'slot-cancelled 0.35s ease-out' }
      : {}

  let status: React.ReactNode

  if (past || locked) {
    status = (
      <span style={badge(colors.bgSubtle, colors.textMuted)}>
        {past ? t('laundry.slot.past') : t('laundry.slot.unavailable')}
      </span>
    )
  } else if (booking?.isOwn) {
    status = (
      <span className="d-flex align-items-center gap-2 flex-wrap justify-content-end">
        <span style={badge(colors.successBg, colors.successText)}>{t('laundry.slot.myBooking')}</span>
        {confirming && pending?.type === 'cancel' ? null : booking.canCancel ? (
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            style={{ fontSize: '0.78rem', padding: '0 14px', borderRadius: 20, minHeight: TAP_TARGET_PX }}
            aria-label={t('laundry.actions.cancelSlot', { time: timeLabel })}
            onClick={(e) => { e.stopPropagation(); onCancel() }}
          >
            {t('laundry.actions.cancelBooking')}
          </button>
        ) : (
          <span style={{ fontSize: '0.72rem', color: colors.textMuted }}>{t('laundry.slot.cancelDeadlinePassed')}</span>
        )}
      </span>
    )
  } else if (takenByOther) {
    status = <span style={badge(colors.bgSubtle, colors.textSecondary)}>{booking.label}</span>
  } else if (blocked) {
    status = null
  } else if (confirming && pending?.type === 'book') {
    status = null
  } else {
    status = (
      // The real control for keyboard/screen-reader users; the row itself stays clickable for mouse users
      <button
        type="button"
        className="btn btn-sm btn-outline-primary fw-semibold"
        style={{ fontSize: '0.8rem', borderRadius: 20, padding: '0 18px', minHeight: TAP_TARGET_PX }}
        aria-label={t('laundry.actions.bookSlot', { time: timeLabel })}
        onClick={(e) => { e.stopPropagation(); onBook() }}
      >
        {t('laundry.actions.book')}
      </button>
    )
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onAnimationEnd={() => setFlash(null)}
      onClick={isClickable ? onBook : undefined}
      style={{
        borderBottom: `1px solid ${colors.borderRow}`,
        backgroundColor: rowBg,
        boxShadow: confirming ? `inset 4px 0 0 ${pending?.type === 'cancel' ? colors.dangerText : colors.primary}` : undefined,
        opacity: dimmed ? 0.45 : blocked ? 0.5 : 1,
        cursor: isClickable ? 'pointer' : 'default',
        transition: (justBooked || justCancelled) ? 'none' : 'background-color 0.12s',
        userSelect: 'none',
        ...animationStyle,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 20px', minHeight: TAP_TARGET_PX + 12 }}>
        <span style={{ fontSize: '0.9rem', fontWeight: 500, color: takenByOther ? colors.slotTakenText : colors.textPrimary }}>
          {timeLabel}
        </span>
        {status}
      </div>
      {confirming && pending && (
        <InlineConfirmPanel
          pending={pending}
          loading={!!confirmLoading}
          error={confirmError ?? null}
          usage={usage}
          onConfirm={onConfirm!}
          onDismiss={onDismissConfirm!}
          style={{ padding: '2px 20px 14px' }}
        />
      )}
    </div>
  )
}
