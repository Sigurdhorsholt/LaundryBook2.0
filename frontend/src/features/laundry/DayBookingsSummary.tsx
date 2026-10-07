import { useId, useState } from 'react'
import type { LaundryBooking } from './useLaundryBooking'
import { NextBookingCompact } from './NextBookingCompact'
import { MyBookingsCard } from './MyBookingsCard'
import { nextBooking } from './utils'

interface Props {
  booking: LaundryBooking
}

// Phone/tablet stand-in for the desktop side panel's booking cards. "Se alle" expands the list
// in place until My page lists bookings (#112).
export function DayBookingsSummary({ booking: lb }: Props) {
  const [showAll, setShowAll] = useState(false)
  const listId = useId()
  const next = nextBooking(lb.myBookings)
  if (!next) return null
  const counted = lb.myBookings.filter(b => b.date >= lb.today)

  return (
    <div className="d-flex flex-column gap-3 mb-4">
      <NextBookingCompact
        booking={next}
        today={lb.today}
        used={lb.usedBookings}
        max={lb.maxBookings}
        totalCount={counted.length}
        showAll={showAll}
        listId={listId}
        onToggleAll={() => setShowAll(x => !x)}
        onCancel={lb.handleCancelUpcoming}
      />
      {showAll && (
        <div id={listId}>
          <MyBookingsCard
            bookings={counted}
            used={lb.usedBookings}
            max={lb.maxBookings}
            today={lb.today}
            onCancel={lb.handleCancelUpcoming}
          />
        </div>
      )}
    </div>
  )
}
