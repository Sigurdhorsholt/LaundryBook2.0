import { useTranslation } from 'react-i18next'
import { NextBookingCompact } from '../../../features/laundry/NextBookingCompact'
import { DateStrip } from '../../../features/laundry/DateStrip'
import { BookingGrid } from '../../../features/laundry/BookingGrid'
import { bookingLabel, freeSlotCount, type WeekCellContext } from '../../../features/laundry/utils'
import type { AvailabilityState, GridBooking } from '../../../features/laundry/types'
import { BookingMode } from '../../../features/properties/propertiesApi'
import { addDays, formatDateFull, isPast } from '../../../shared/utils/dateUtils'
import { colors } from '../../../shared/theme'
import { PhoneFrame } from './PhoneFrame'
import { PREVIEW_ROOM, previewSlots, previewWeek } from './previewData'

const noop = () => {}

interface Props {
  width: number
}

// The real phone day view (next booking, date strip and the day's times) with made-up bookings
export function PhonePreview({ width }: Props) {
  const { t } = useTranslation()
  const { today, weekDays, bookings, myBookings } = previewWeek()
  const context: WeekCellContext = { today, lookaheadDays: 14, machineMode: false, machines: [], bookings }
  const availability = Object.fromEntries(weekDays.map(d => {
    const free = freeSlotCount(previewSlots, d, context)
    const state: AvailabilityState = d < today ? 'past' : free === 0 ? 'full' : free <= 2 ? 'few' : 'free'
    return [d, state]
  }))
  // Late in the day almost every time has passed, so the phone shows tomorrow instead
  const leftToday = previewSlots.filter(s => !isPast(today, s.startTime, today)).length
  const day = leftToday < 3 && today !== weekDays[6] ? addDays(today, 1) : today
  const gridBookings: GridBooking[] = bookings.filter(b => b.date === day).map(b => ({
    bookingId: b.id, slotId: b.timeSlotTemplateId, isOwn: b.isOwn, label: bookingLabel(b),
    canCancel: b.canCancel, machineId: null, machineName: null,
  }))
  const next = myBookings[0]

  return (
    <PhoneFrame label={t('public.previews.phoneAlt')} width={width}>
      <div style={{ padding: '18px 14px 8px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {next && (
          <NextBookingCompact
            booking={next} today={today} used={myBookings.length} max={3}
            totalCount={myBookings.length} showAll={false} listId="preview-mine" onToggleAll={noop} onCancel={noop}
          />
        )}
        <section style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.borderDefault}`, borderRadius: 14, overflow: 'hidden' }}>
          <DateStrip weekDays={weekDays} today={today} selectedDate={day} availabilityByDate={availability} onSelectDate={noop} />
          <div style={{ padding: '8px 16px', backgroundColor: colors.bgSubtle, borderBottom: `1px solid ${colors.borderRow}`, fontSize: '0.82rem', fontWeight: 500, color: colors.textSecondary }}>
            {formatDateFull(day)} · {PREVIEW_ROOM}
          </div>
          <BookingGrid
            slots={previewSlots}
            date={day}
            today={today}
            bookingLookaheadDays={14}
            gridBookings={gridBookings}
            maxReached={false}
            bookingMode={BookingMode.BookEntireRoom}
            machines={[]}
            onBook={noop}
            onCancel={noop}
          />
        </section>
      </div>
    </PhoneFrame>
  )
}
