import { useMemo } from 'react'
import type { AdminBookingDto } from './laundryApi'
import { EmptyState } from '../../shared/ui'
import { formatDateFull, formatTimeRange, dayShortLabel, isPast } from '../../shared/utils/dateUtils'
import { colors } from '../../shared/theme'

interface Props {
  bookings: AdminBookingDto[]   // scoped to the loaded period, sorted by date then start time
  today: string
  onCancel: (booking: AdminBookingDto) => void
}

export function AdminBookingsList({ bookings, today, onCancel }: Props) {
  const groups = useMemo(() => {
    const byDate = new Map<string, AdminBookingDto[]>()
    for (const b of bookings) {
      const list = byDate.get(b.date)
      if (list) list.push(b)
      else byDate.set(b.date, [b])
    }
    return Array.from(byDate.entries())
  }, [bookings])

  if (bookings.length === 0) {
    return (
      <EmptyState
        title="Ingen bookinger i perioden"
        description="Der blev ikke booket tider i det valgte tidsrum."
      />
    )
  }

  return (
    <div className="d-flex flex-column gap-3">
      {groups.map(([date, dayBookings]) => {
        const dayIsPast = date < today
        return (
          <div
            key={date}
            style={{
              border: `1px solid ${colors.borderDefault}`,
              borderRadius: 12,
              backgroundColor: colors.bgCard,
              overflow: 'hidden',
              opacity: dayIsPast ? 0.7 : 1,
            }}
          >
            <div
              style={{
                padding: '10px 20px',
                backgroundColor: date === today ? colors.primaryLighter : colors.bgHeader,
                borderBottom: `1px solid ${colors.borderRow}`,
                display: 'flex',
                alignItems: 'baseline',
                gap: 8,
              }}
            >
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: colors.primary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {dayShortLabel(date, today)}
              </span>
              <span style={{ fontSize: '0.88rem', fontWeight: 600, color: colors.textPrimary, textTransform: 'capitalize' }}>
                {formatDateFull(date)}
              </span>
              <span style={{ fontSize: '0.8rem', color: colors.textMuted, marginLeft: 'auto' }}>
                {dayBookings.length} booking{dayBookings.length === 1 ? '' : 'er'}
              </span>
            </div>

            {dayBookings.map((b) => (
              <BookingRow
                key={b.id}
                booking={b}
                canCancel={!isPast(b.date, b.startTime, today)}
                onCancel={() => onCancel(b)}
              />
            ))}
          </div>
        )
      })}
    </div>
  )
}

function BookingRow({ booking, canCancel, onCancel }: { booking: AdminBookingDto; canCancel: boolean; onCancel: () => void }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        padding: '11px 20px',
        borderBottom: `1px solid ${colors.borderRow}`,
        flexWrap: 'wrap',
      }}
    >
      <div className="d-flex align-items-center gap-3 flex-wrap" style={{ minWidth: 0 }}>
        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: colors.textPrimary, minWidth: 110 }}>
          {formatTimeRange(booking.startTime, booking.endTime)}
        </span>
        <span style={{ fontSize: '0.85rem', color: colors.textSecondary }}>
          {booking.roomName}
        </span>
      </div>

      <div className="d-flex align-items-center gap-3 flex-wrap">
        <span style={{ fontSize: '0.85rem', color: colors.textPrimary }}>
          {booking.residentName}
          {booking.apartmentNumber && (
            <span style={{ color: colors.textMuted, marginLeft: 6 }}>· Lejl. {booking.apartmentNumber}</span>
          )}
        </span>
        {canCancel && (
          <button
            className="btn btn-sm btn-outline-secondary"
            style={{ fontSize: '0.75rem', padding: '2px 12px', borderRadius: 20 }}
            onClick={onCancel}
          >
            Aflys
          </button>
        )}
      </div>
    </div>
  )
}
