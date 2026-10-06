import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useGetMyBookingsQuery, useCancelBookingMutation, type MyBookingDto } from '../laundry/laundryApi'
import { EmptyState, Spinner } from '../../shared/ui'
import { colors } from '../../shared/theme'
import { todayStr, formatDateFull, formatTimeRange } from '../../shared/utils/dateUtils'

interface Props {
  propertyId: string
}

function BookingRow({
  booking, onCancel, cancelling,
}: { booking: MyBookingDto; onCancel?: () => void; cancelling: boolean }) {
  const { t } = useTranslation()
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
          {formatDateFull(booking.date)} · {formatTimeRange(booking.startTime, booking.endTime)}
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
          {t('profile.cancelBooking')}
        </button>
      )}
    </div>
  )
}

export function BookingsOverview({ propertyId }: Props) {
  const { t } = useTranslation()
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
          <h5 className="mb-3" style={{ fontWeight: 600, color: colors.textPrimary }}>{t('profile.upcomingBookings')}</h5>
          {upcoming.length === 0
            ? <EmptyState title={t('profile.noUpcomingBookings')} />
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
          <h5 className="mb-3" style={{ fontWeight: 600, color: colors.textPrimary }}>{t('profile.pastBookings')}</h5>
          {past.length === 0
            ? <EmptyState title={t('profile.noPastBookings')} />
            : past.map(b => (
                <BookingRow key={b.id} booking={b} cancelling={false} />
              ))
          }
        </div>
      </div>
    </div>
  )
}
