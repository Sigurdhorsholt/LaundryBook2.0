import { useState, useEffect, useRef } from 'react'
import type { TimeSlotTemplateDto } from './laundryApi'
import type { GridBooking, PendingAction } from './types'
import { formatTime } from '../../shared/utils/dateUtils'
import { colors } from '../../shared/theme'
import { badge } from './slotBadge'
import { InlineConfirm, ConfirmMessage } from './InlineConfirm'

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
}

export function SlotRow({
  slot, booking, past, locked, blocked, onBook, onCancel,
  pending, confirmLoading, confirmError, onConfirm, onDismissConfirm,
}: Props) {
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
  const confirming = pending != null && !!onConfirm && !!onDismissConfirm
  const isClickable = !past && !locked && booking === null && !blocked && !confirming

  const rowBg =
    (justBooked || booking?.isOwn)              ? colors.slotOwnBg :
    takenByOther                                ? colors.slotTakenBg :
    (confirming && pending?.type === 'book')    ? colors.primaryLighter :
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
        {past ? 'Passeret' : 'Ikke tilgængeligt'}
      </span>
    )
  } else if (booking?.isOwn) {
    status = (
      <span className="d-flex align-items-center gap-2 flex-wrap justify-content-end">
        <span style={badge(colors.successBg, colors.successText)}>Min booking</span>
        {confirming && pending?.type === 'cancel' ? (
          <InlineConfirm variant="cancel" loading={!!confirmLoading} onConfirm={onConfirm!} onDismiss={onDismissConfirm!} />
        ) : booking.canCancel ? (
          <button
            className="btn btn-sm btn-outline-secondary"
            style={{ fontSize: '0.75rem', padding: '2px 10px', borderRadius: 20 }}
            onClick={(e) => { e.stopPropagation(); onCancel() }}
          >
            Aflys
          </button>
        ) : (
          <span style={{ fontSize: '0.72rem', color: colors.textMuted }}>Aflysfrist udløbet</span>
        )}
      </span>
    )
  } else if (takenByOther) {
    status = <span style={badge(colors.bgSubtle, colors.textSecondary)}>{booking.label}</span>
  } else if (blocked) {
    status = null
  } else if (confirming && pending?.type === 'book') {
    status = <InlineConfirm variant="book" loading={!!confirmLoading} onConfirm={onConfirm!} onDismiss={onDismissConfirm!} />
  } else {
    status = (
      <button
        className="btn btn-sm btn-outline-primary fw-semibold"
        style={{ fontSize: '0.78rem', borderRadius: 20, padding: '3px 16px', pointerEvents: 'none' }}
        tabIndex={-1}
        aria-hidden
      >
        Book
      </button>
    )
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={isClickable ? onBook : undefined}
      style={{
        borderBottom: `1px solid ${colors.borderRow}`,
        backgroundColor: rowBg,
        opacity: dimmed ? 0.45 : blocked ? 0.5 : 1,
        cursor: isClickable ? 'pointer' : 'default',
        transition: (justBooked || justCancelled) ? 'none' : 'background-color 0.12s',
        userSelect: 'none',
        ...animationStyle,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 20px' }}>
        <span style={{ fontSize: '0.9rem', fontWeight: 500, color: takenByOther ? colors.slotTakenText : colors.textPrimary }}>
          {timeLabel}
        </span>
        {status}
      </div>
      {confirming && pending && (
        <ConfirmMessage pending={pending} error={confirmError ?? null} style={{ padding: '0 20px 9px' }} />
      )}
    </div>
  )
}
