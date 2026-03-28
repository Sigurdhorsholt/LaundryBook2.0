/**
 * BookingGrid — reusable day-view booking component.
 *
 * Designed to be used in both the admin preview page and the real resident booking
 * route. The parent is responsible for computing GridBooking[] from whatever data
 * source it has (local preview state today, real API data later).
 * The grid itself only handles rendering and the date-based past/locked states.
 */

import { useState, useEffect, useRef } from 'react'
import type { TimeSlotTemplateDto } from './laundryApi'
import { colors } from '../../shared/theme'

// ── Public types ───────────────────────────────────────────────────────────────

/** A booking as seen from the active user's perspective, pre-computed by the parent. */
export interface GridBooking {
  slotId: string
  isOwn: boolean      // true = belongs to the current/viewing user
  label: string       // display text: "Min booking" | "Anna Hansen" | "Lejl. 2B" | "Optaget"
  canCancel: boolean  // only meaningful when isOwn=true
}

interface BookingGridProps {
  slots: TimeSlotTemplateDto[]
  date: string                 // "YYYY-MM-DD" — which day to render
  today: string                // "YYYY-MM-DD" — used for past/locked logic
  bookingLookaheadDays: number
  gridBookings: GridBooking[]  // pre-computed for this date+room combination
  maxReached: boolean          // active user has hit their concurrent booking limit
  onBook: (slotId: string) => void
  onCancel: (slotId: string) => void
  loading?: boolean            // shows skeleton rows while slots are fetched
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatTime(time: string): string {
  return time.slice(0, 5)
}

function addDays(dateStr: string, n: number): string {
  const parts = dateStr.split('-').map(Number)
  const d = new Date(parts[0] ?? 2025, (parts[1] ?? 1) - 1, (parts[2] ?? 1) + n)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function isPast(date: string, startTime: string, today: string): boolean {
  if (date < today) return true
  if (date === today) {
    const parts = startTime.split(':').map(Number)
    const slotStart = new Date()
    slotStart.setHours(parts[0] ?? 0, parts[1] ?? 0, 0, 0)
    return slotStart <= new Date()
  }
  return false
}

function isLocked(date: string, today: string, lookaheadDays: number): boolean {
  return date > addDays(today, lookaheadDays)
}

// ── Skeleton row (Task 7) ──────────────────────────────────────────────────────

function SlotSkeleton() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '11px 20px',
        borderBottom: `1px solid ${colors.borderRow}`,
      }}
    >
      <div
        style={{
          width: 80, height: 14, borderRadius: 4,
          backgroundColor: colors.borderDefault,
          animation: 'skeleton-pulse 1.4s ease-in-out infinite',
        }}
      />
      <div
        style={{
          width: 64, height: 28, borderRadius: 20,
          backgroundColor: colors.borderDefault,
          animation: 'skeleton-pulse 1.4s ease-in-out infinite',
        }}
      />
    </div>
  )
}

// ── Component ──────────────────────────────────────────────────────────────────

export function BookingGrid({
  slots,
  date,
  today,
  bookingLookaheadDays,
  gridBookings,
  maxReached,
  onBook,
  onCancel,
  loading,
}: BookingGridProps) {
  // Task 7 — skeleton while loading
  if (loading) {
    return (
      <div>
        {Array.from({ length: 8 }, (_, i) => <SlotSkeleton key={i} />)}
      </div>
    )
  }

  // Task 6C — no slots configured
  if (slots.length === 0) {
    return (
      <div style={{ padding: '32px 20px', textAlign: 'center' }}>
        <p style={{ color: colors.textPrimary, fontWeight: 600, marginBottom: 4, fontSize: '0.9rem' }}>
          Ingen tider opsat endnu
        </p>
        <p style={{ color: colors.textMuted, fontSize: '0.82rem', marginBottom: 0 }}>
          Administratoren har ikke konfigureret tidspladser for dette lokale.
        </p>
      </div>
    )
  }

  // Task 6A — detect if every slot is unavailable (past, locked, or taken)
  const allUnavailable = slots.every((slot) => {
    const booking = gridBookings.find((b) => b.slotId === slot.id) ?? null
    return (
      isPast(date, slot.startTime, today) ||
      isLocked(date, today, bookingLookaheadDays) ||
      booking !== null
    )
  })

  return (
    <div>
      {/* Task 6B — maxReached: single explanatory banner instead of per-row text */}
      {maxReached && (
        <div
          style={{
            padding: '10px 20px',
            fontSize: '0.82rem',
            display: 'flex',
            gap: 6,
            flexWrap: 'wrap',
            backgroundColor: '#fff3e0',
            borderBottom: `1px solid ${colors.warningBorder}`,
            color: '#7a3f00',
          }}
        >
          <strong>Du har nået din bookinggrænse.</strong>
          <span>Aflys en aktiv booking for at frigøre en plads.</span>
        </div>
      )}

      {/* Task 6A — all slots taken/past banner */}
      {!maxReached && allUnavailable && (
        <div
          style={{
            padding: '10px 20px',
            fontSize: '0.82rem',
            backgroundColor: colors.warningBg,
            borderBottom: '1px solid #f0e0b0',
            color: '#7a5c00',
          }}
        >
          Ingen ledige tider denne dag.
        </div>
      )}

      {slots.map((slot) => {
        const booking = gridBookings.find((b) => b.slotId === slot.id) ?? null
        const past    = isPast(date, slot.startTime, today)
        const locked  = isLocked(date, today, bookingLookaheadDays)
        const blocked = maxReached && booking === null && !past && !locked

        return (
          <SlotRow
            key={slot.id}
            slot={slot}
            booking={booking}
            past={past}
            locked={locked}
            blocked={blocked}
            onBook={() => onBook(slot.id)}
            onCancel={() => onCancel(slot.id)}
          />
        )
      })}
    </div>
  )
}

// ── SlotRow ────────────────────────────────────────────────────────────────────

function SlotRow({
  slot,
  booking,
  past,
  locked,
  blocked,
  onBook,
  onCancel,
}: {
  slot: TimeSlotTemplateDto
  booking: GridBooking | null
  past: boolean
  locked: boolean
  blocked: boolean
  onBook: () => void
  onCancel: () => void
}) {
  // Task 4 — hover state
  const [hovered, setHovered] = useState(false)

  // Task 5 — detect booking state transitions for micro-animation
  const [justBooked,    setJustBooked]    = useState(false)
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

  const timeLabel   = `${formatTime(slot.startTime)} – ${formatTime(slot.endTime)}`
  const dimmed      = past || locked
  const takenByOther = booking !== null && !booking.isOwn
  const isClickable  = !past && !locked && booking === null && !blocked

  // Background — animation overrides this during the transition frames
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

  // ── Status element ───────────────────────────────────────────────────────────

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
        <span style={badge('#e8f5e9', colors.successText)}>Min booking</span>
        {booking.canCancel ? (
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
    // Task 6B — no per-row text; the banner above explains the situation
    status = null
  } else {
    // Task 4 — Book button stays for visual affordance; row click handles the action
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

// ── Style helpers ──────────────────────────────────────────────────────────────

function badge(bg: string, color: string): React.CSSProperties {
  return {
    display: 'inline-block',
    padding: '3px 10px',
    borderRadius: 20,
    backgroundColor: bg,
    color,
    fontSize: '0.78rem',
    fontWeight: 500,
    whiteSpace: 'nowrap' as const,
  }
}
