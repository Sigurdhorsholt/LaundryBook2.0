import { useTranslation } from 'react-i18next'
import type { LaundryBooking } from './useLaundryBooking'
import { NextBookingCard } from './NextBookingCard'
import { MyBookingsCard } from './MyBookingsCard'
import { RoomInfoCard } from './RoomInfoCard'
import { nextBooking } from './utils'

interface Props {
  booking: LaundryBooking
  // 'column' sits beside the week grid on wide screens; 'row' sits under it when the grid needs the width
  layout: 'column' | 'row'
}

export function BookingSidePanel({ booking: lb, layout }: Props) {
  const { t } = useTranslation()
  const next = nextBooking(lb.myBookings)
  const counted = lb.myBookings.filter(b => b.date >= lb.today)

  const style: React.CSSProperties = layout === 'column'
    ? { width: 340, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16 }
    : { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, alignItems: 'start' }

  return (
    <aside aria-label={t('laundry.mine.title')} style={style}>
      {next && <NextBookingCard booking={next} onCancel={lb.handleCancelUpcoming} />}
      <MyBookingsCard
        bookings={counted}
        used={lb.usedBookings}
        max={lb.maxBookings}
        today={lb.today}
        onCancel={lb.handleCancelUpcoming}
      />
      {lb.selectedRoom && lb.settings && (
        <RoomInfoCard
          room={lb.selectedRoom}
          machines={lb.machines}
          lookaheadDays={lb.lookaheadDays}
          maxBookings={lb.maxBookings}
          cancellationWindowMinutes={lb.settings.cancellationWindowMinutes}
        />
      )}
    </aside>
  )
}
