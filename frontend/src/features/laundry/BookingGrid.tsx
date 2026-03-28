/**
 * BookingGrid — reusable day-view booking component.
 *
 * Designed to be used in both the admin preview page and the real resident booking
 * route. The parent is responsible for computing GridBooking[] from whatever data
 * source it has (local preview state today, real API data later).
 * The grid itself only handles rendering and the date-based past/locked states.
 */

import type { TimeSlotTemplateDto } from './laundryApi'

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
}: BookingGridProps) {
  if (slots.length === 0) {
    return (
      <div
        className="py-5 text-center"
        style={{ color: '#a0adb8', fontSize: '0.9rem' }}
      >
        Ingen tidspladser konfigureret for dette lokale.
      </div>
    )
  }

  return (
    <div>
      {slots.map((slot) => {
        const booking = gridBookings.find((b) => b.slotId === slot.id) ?? null
        const past    = isPast(date, slot.startTime, today)
        const locked  = isLocked(date, today, bookingLookaheadDays)
        // maxReached only blocks available slots — already-booked slots ignore it
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
  const timeLabel = `${formatTime(slot.startTime)} – ${formatTime(slot.endTime)}`
  const dimmed = past || locked

  let status: React.ReactNode

  if (past || locked) {
    status = (
      <span style={badge('#f0f4f8', '#a0adb8')}>
        {past ? 'Passeret' : 'Ikke tilgængeligt'}
      </span>
    )
  } else if (booking?.isOwn) {
    status = (
      <span className="d-flex align-items-center gap-2 flex-wrap justify-content-end">
        <span style={badge('#e8f5e9', '#2e7d32')}>Min booking</span>
        {booking.canCancel ? (
          <button
            className="btn btn-sm btn-outline-secondary"
            style={{ fontSize: '0.75rem', padding: '2px 10px', borderRadius: 20 }}
            onClick={onCancel}
          >
            Aflys
          </button>
        ) : (
          <span style={{ fontSize: '0.72rem', color: '#a0adb8' }}>Aflysfrist udløbet</span>
        )}
      </span>
    )
  } else if (booking !== null) {
    // Someone else's booking
    status = <span style={badge('#f0f4f8', '#5a6a7a')}>{booking.label}</span>
  } else if (blocked) {
    status = <span style={{ fontSize: '0.78rem', color: '#b45309' }}>Maks. nået</span>
  } else {
    status = (
      <button
        className="btn btn-sm btn-outline-primary fw-semibold"
        style={{ fontSize: '0.78rem', borderRadius: 20, padding: '3px 16px' }}
        onClick={onBook}
      >
        Book
      </button>
    )
  }

  const takenByOther = booking !== null && !booking.isOwn
  const rowBg =
    booking?.isOwn ? '#f0fdf4' :
    takenByOther    ? '#f2f4f7' :
                      '#ffffff'

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '11px 20px',
        borderBottom: '1px solid #f0f4f8',
        backgroundColor: rowBg,
        opacity: dimmed ? 0.45 : 1,
        transition: 'background-color 0.1s',
      }}
    >
      <span style={{ fontSize: '0.9rem', fontWeight: 500, color: takenByOther ? '#8a9aaa' : '#0d1b2a' }}>
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
