import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useGetMyBookingsQuery, useCancelBookingMutation, type MyBookingDto } from '../laundry/laundryApi'
import { EmptyState, Spinner } from '../../shared/ui'
import { colors } from '../../shared/theme'
import { todayStr, formatDateFull, formatTimeRange, minutesUntilSlot } from '../../shared/utils/dateUtils'
import { extractErrorMessage } from '../../shared/utils/errorUtils'
import { ConfirmBookingModal } from '../laundry/ConfirmBookingModal'
import type { PendingAction } from '../laundry/types'

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
  const [cancelBooking, { isLoading: cancelling }] = useCancelBookingMutation()
  const [pendingCancel, setPendingCancel] = useState<{ action: PendingAction; booking: MyBookingDto } | null>(null)
  const [cancelError, setCancelError] = useState<string | null>(null)
  const today = todayStr()

  const { upcoming, past } = useMemo(() => {
    if (!bookings) return { upcoming: [], past: [] }
    const sorted = [...bookings].sort((a, b) => (a.date < b.date ? -1 : 1))
    return {
      upcoming: sorted.filter(b => b.date >= today),
      past: sorted.filter(b => b.date < today).reverse().slice(0, 10),
    }
  }, [bookings, today])

  // One tap used to cancel immediately with no confirmation and no feedback on failure
  function askCancel(booking: MyBookingDto) {
    setCancelError(null)
    setPendingCancel({
      booking,
      action: {
        type: 'cancel', source: 'upcoming', slotId: booking.timeSlotTemplateId, date: booking.date,
        slotTime: formatTimeRange(booking.startTime, booking.endTime),
        bookingId: booking.id,
        minutesUntil: minutesUntilSlot(booking.date, booking.startTime),
        machineName: booking.machineName ?? undefined,
      },
    })
  }

  async function confirmCancel() {
    if (!pendingCancel) return
    const { booking } = pendingCancel
    try {
      await cancelBooking({ bookingId: booking.id, roomId: booking.roomId, propertyId }).unwrap()
      setPendingCancel(null)
    } catch (err) {
      setCancelError(extractErrorMessage(err, t('common.genericError')))
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
                  onCancel={() => askCancel(b)}
                  cancelling={cancelling && pendingCancel?.booking.id === b.id}
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

      {pendingCancel && (
        <ConfirmBookingModal
          pending={pendingCancel.action}
          error={cancelError}
          loading={cancelling}
          onConfirm={confirmCancel}
          onClose={() => { setPendingCancel(null); setCancelError(null) }}
        />
      )}
    </div>
  )
}
