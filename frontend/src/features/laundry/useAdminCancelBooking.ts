import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useCancelBookingMutation, type AdminBookingDto } from './laundryApi'
import type { AdminCancelTarget } from './types'
import { formatDateFull, formatTimeRange } from '../../shared/utils/dateUtils'

export function useAdminCancelBooking(propertyId: string | undefined) {
  const { t } = useTranslation()
  const [target, setTarget] = useState<AdminCancelTarget | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [cancelBooking, { isLoading: cancelling }] = useCancelBookingMutation()

  function open(b: AdminBookingDto) {
    setError(null)
    setTarget({
      bookingId: b.id,
      roomId: b.roomId,
      roomName: b.machineName ? `${b.roomName} · ${b.machineName}` : b.roomName,
      residentName: b.residentName,
      dateLabel: formatDateFull(b.date),
      slotTime: formatTimeRange(b.startTime, b.endTime),
    })
  }

  async function confirm() {
    if (!target || !propertyId) return
    try {
      await cancelBooking({ bookingId: target.bookingId, roomId: target.roomId, propertyId }).unwrap()
      setTarget(null)
    } catch {
      setError(t('adminProperties.bookings.cancelError'))
    }
  }

  return { target, error, cancelling, open, confirm, close: () => setTarget(null) }
}
