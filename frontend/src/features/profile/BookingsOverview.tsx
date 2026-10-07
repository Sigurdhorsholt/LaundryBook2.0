import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useGetMyBookingsQuery, useCancelBookingMutation, type MyBookingDto } from '../laundry/laundryApi'
import { BookingRow } from './BookingRow'
import { PastBookingsCard } from './PastBookingsCard'
import { useAddToCalendar } from '../laundry/useAddToCalendar'
import { EmptyState, Spinner } from '../../shared/ui'
import { colors } from '../../shared/theme'
import { formatTimeRange, minutesUntilSlot } from '../../shared/utils/dateUtils'
import { extractErrorMessage } from '../../shared/utils/errorUtils'
import { ConfirmBookingModal } from '../laundry/ConfirmBookingModal'
import type { PendingAction } from '../laundry/types'

interface Props {
  propertyId: string
}

export function BookingsOverview({ propertyId }: Props) {
  const { t } = useTranslation()
  // Only today onwards; the past comes from the history endpoint
  const { data: upcoming = [], isLoading } = useGetMyBookingsQuery(propertyId)
  const [cancelBooking, { isLoading: cancelling }] = useCancelBookingMutation()
  const addToCalendar = useAddToCalendar()
  const [pendingCancel, setPendingCancel] = useState<{ action: PendingAction; booking: MyBookingDto } | null>(null)
  const [cancelError, setCancelError] = useState<string | null>(null)

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
                  onAddToCalendar={() => addToCalendar(b)}
                  cancelling={cancelling && pendingCancel?.booking.id === b.id}
                />
              ))
          }
        </div>
      </div>
      <PastBookingsCard propertyId={propertyId} />

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
