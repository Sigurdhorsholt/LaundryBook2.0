import { useActiveProperty } from '../properties/useActiveProperty'
import type { MyBookingDto } from './laundryApi'
import { bookingCalendarFile } from './utils'
import { downloadTextFile } from '../../shared/utils/fileUtils'

// The phone's own calendar then handles reminders, so we don't need to send any
export function useAddToCalendar() {
  const { membership } = useActiveProperty()
  const propertyName = membership?.propertyName ?? null

  return (b: MyBookingDto) => downloadTextFile(
    `laundrybook-${b.date}-${b.startTime.slice(0, 5).replace(':', '')}.ics`,
    bookingCalendarFile(b, propertyName),
    'text/calendar;charset=utf-8',
  )
}
