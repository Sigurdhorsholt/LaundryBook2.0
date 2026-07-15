import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import type { TimeSlotTemplateDto } from './laundryApi'
import type { GridBooking } from './types'
import { formatTime } from '../../shared/utils/dateUtils'
import { colors } from '../../shared/theme'
import { badge } from './slotBadge'

interface Props {
  slot: TimeSlotTemplateDto
  booking: GridBooking | null
  past: boolean
  locked: boolean
  blocked: boolean
  onBook: () => void
  onCancel: () => void
}

export function SlotRow({ slot, booking, past, locked, blocked, onBook, onCancel }: Props) {
  const { t } = useTranslation()
  const [hovered, setHovered] = useState(false)

  const [justBooked, setJustBooked] = useState(false)
  const [justCancelled, setJustCancelled] = useState(false)
  const prevBookingRef = useRef<GridBooking | null>(null)

  useEffect(() => {
    const prev = prevBookingRef.current
    prevBookingRef.current = booking

    if (prev === null && booking?.isOwn) {
      setJustBooked(true)
      const t = setTimeout(() => setJustBooked(false), 500)
      return () => clearTimeout(t)
    }
    if (prev?.isOwn && booking === null) {
      setJustCancelled(true)
      const t = setTimeout(() => setJustCancelled(false), 400)
      return () => clearTimeout(t)
    }
  }, [booking])

  const timeLabel = `${formatTime(slot.startTime)} – ${formatTime(slot.endTime)}`
  const dimmed = past || locked
  const takenByOther = booking !== null && !booking.isOwn
  const isClickable = !past && !locked && booking === null && !blocked

  const rowBg =
    (justBooked || booking?.isOwn) ? colors.slotOwnBg :
    takenByOther                    ? colors.slotTakenBg :
    (hovered && isClickable)        ? colors.primaryLighter :
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
        {booking.canCancel ? (
          <button
            className="btn btn-sm btn-outline-secondary"
            style={{ fontSize: '0.75rem', padding: '2px 10px', borderRadius: 20 }}
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
  } else {
    status = (
      <button
        className="btn btn-sm btn-outline-primary fw-semibold"
        style={{ fontSize: '0.78rem', borderRadius: 20, padding: '3px 16px', pointerEvents: 'none' }}
        tabIndex={-1}
        aria-hidden
      >
        {t('laundry.actions.book')}
      </button>
    )
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={isClickable ? onBook : undefined}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '11px 20px',
        borderBottom: `1px solid ${colors.borderRow}`,
        backgroundColor: rowBg,
        opacity: dimmed ? 0.45 : blocked ? 0.5 : 1,
        cursor: isClickable ? 'pointer' : 'default',
        transition: (justBooked || justCancelled) ? 'none' : 'background-color 0.12s',
        userSelect: 'none',
        ...animationStyle,
      }}
    >
      <span style={{ fontSize: '0.9rem', fontWeight: 500, color: takenByOther ? colors.slotTakenText : colors.textPrimary }}>
        {timeLabel}
      </span>
      {status}
    </div>
  )
}
