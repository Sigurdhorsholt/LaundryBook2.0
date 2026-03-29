import { useMemo, useState } from 'react'
import { useGetMyBookingsQuery, useCancelBookingMutation, type MyBookingDto } from '../laundry/laundryApi'
import { EmptyState, Spinner } from '../../shared/ui'
import { colors } from '../../shared/theme'

interface Props {
  propertyId: string
}

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function fmtDate(date: string) {
  return new Date(date + 'T00:00:00').toLocaleDateString('da-DK', {
    weekday: 'short', day: 'numeric', month: 'short',
  })
}

function fmtTime(t: string) { return t.slice(0, 5) }

function BookingRow({
  booking, onCancel, cancelling,
}: { booking: MyBookingDto; onCancel?: () => void; cancelling: boolean }) {
  return (
    <div
      className="d-flex align-items-center justify-content-between py-2 px-3"
      style={{ borderRadius: 8, backgroundColor: colors.bgMuted, marginBottom: 6 }}
    >
      <div>
        <div style={{ fontWeight: 600, fontSize: '0.88rem', color: colors.textPrimary }}>
          {booking.roomName}
        </div>
        <div style={{ fontSize: '0.8rem', color: colors.textSecondary }}>
          {fmtDate(booking.date)} · {fmtTime(booking.startTime)}–{fmtTime(booking.endTime)}
        </div>
      </div>
      {onCancel && booking.canCancel && (
        <button
          className="btn btn-sm"
          style={{
            borderRadius: 7,
            fontSize: '0.78rem',
            color: colors.dangerText,
            border: `1px solid ${colors.dangerBorder}`,
            backgroundColor: colors.dangerBg,
          }}
          onClick={onCancel}
          disabled={cancelling}
        >
          Aflys
        </button>
      )}
    </div>
  )
}

export function BookingsOverview({ propertyId }: Props) {
  const { data: bookings, isLoading } = useGetMyBookingsQuery(propertyId)
  const [cancelBooking] = useCancelBookingMutation()
  const [cancelling, setCancelling] = useState<string | null>(null)
  const today = todayStr()

  const { upcoming, past } = useMemo(() => {
    if (!bookings) return { upcoming: [], past: [] }
    const sorted = [...bookings].sort((a, b) => (a.date < b.date ? -1 : 1))
    return {
      upcoming: sorted.filter(b => b.date >= today),
      past: sorted.filter(b => b.date < today).reverse().slice(0, 10),
    }
  }, [bookings, today])

  async function handleCancel(booking: MyBookingDto) {
    setCancelling(booking.id)
    try {
      await cancelBooking({ bookingId: booking.id, roomId: booking.roomId, propertyId }).unwrap()
    } finally {
      setCancelling(null)
    }
  }

  if (isLoading) return <Spinner />

  return (
    <div>
      <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: 12 }}>
        <div className="card-body p-4">
          <h5 className="mb-3" style={{ fontWeight: 600, color: colors.textPrimary }}>Kommende bookinger</h5>
          {upcoming.length === 0
            ? <EmptyState title="Ingen kommende bookinger" />
            : upcoming.map(b => (
                <BookingRow
                  key={b.id}
                  booking={b}
                  onCancel={() => handleCancel(b)}
                  cancelling={cancelling === b.id}
                />
              ))
          }
        </div>
      </div>
      <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
        <div className="card-body p-4">
          <h5 className="mb-3" style={{ fontWeight: 600, color: colors.textPrimary }}>Tidligere bookinger</h5>
          {past.length === 0
            ? <EmptyState title="Ingen tidligere bookinger" />
            : past.map(b => (
                <BookingRow key={b.id} booking={b} cancelling={false} />
              ))
          }
        </div>
      </div>
    </div>
  )
}
