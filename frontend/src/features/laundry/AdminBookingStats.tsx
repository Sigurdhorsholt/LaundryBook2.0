import { useMemo } from 'react'
import type { AdminBookingDto, AdminRoomSummaryDto } from './laundryApi'
import { colors } from '../../shared/theme'

interface Props {
  bookings: AdminBookingDto[]   // scoped to the loaded period
  rooms: AdminRoomSummaryDto[]
  periodDays: number            // number of days in the loaded period
}

export function AdminBookingStats({ bookings, rooms, periodDays }: Props) {
  const stats = useMemo(() => {
    const activeResidents = new Set(bookings.map((b) => b.userId)).size
    const roomsInUse = new Set(bookings.map((b) => b.roomId)).size

    const bookedByRoom = new Map<string, number>()
    for (const b of bookings) {
      bookedByRoom.set(b.roomId, (bookedByRoom.get(b.roomId) ?? 0) + 1)
    }

    const perRoom = rooms
      .filter((r) => r.isActive)
      .map((r) => {
        const booked = bookedByRoom.get(r.id) ?? 0
        const capacity = r.activeSlotCount * periodDays
        const utilization = capacity > 0 ? Math.round((booked / capacity) * 100) : 0
        return { id: r.id, name: r.name, booked, utilization }
      })

    return { total: bookings.length, activeResidents, roomsInUse, perRoom }
  }, [bookings, rooms, periodDays])

  return (
    <div className="d-flex flex-column gap-3 mb-4">
      <div className="d-flex flex-wrap gap-3">
        <StatTile label="Bookinger i perioden" value={stats.total} />
        <StatTile label="Aktive beboere" value={stats.activeResidents} />
        <StatTile label="Vaskerum i brug" value={stats.roomsInUse} />
      </div>

      {stats.perRoom.length > 0 && (
        <div
          style={{
            border: `1px solid ${colors.borderDefault}`,
            borderRadius: 12,
            backgroundColor: colors.bgCard,
            padding: '16px 20px',
          }}
        >
          <div
            style={{
              fontSize: '0.72rem', fontWeight: 600, color: colors.textMuted,
              textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12,
            }}
          >
            Belægning per vaskerum · i perioden
          </div>
          <div className="d-flex flex-column gap-3">
            {stats.perRoom.map((r) => (
              <RoomUtilizationRow key={r.id} name={r.name} booked={r.booked} utilization={r.utilization} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div
      style={{
        flex: '1 1 140px',
        border: `1px solid ${colors.borderDefault}`,
        borderRadius: 12,
        backgroundColor: colors.bgCard,
        padding: '16px 20px',
      }}
    >
      <div style={{ fontSize: '1.6rem', fontWeight: 700, color: colors.primary, lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: '0.8rem', color: colors.textSecondary, marginTop: 6 }}>
        {label}
      </div>
    </div>
  )
}

function RoomUtilizationRow({ name, booked, utilization }: { name: string; booked: number; utilization: number }) {
  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-1">
        <span style={{ fontSize: '0.85rem', fontWeight: 500, color: colors.textPrimary }}>{name}</span>
        <span style={{ fontSize: '0.8rem', color: colors.textSecondary }}>
          {booked} booking{booked === 1 ? '' : 'er'} · {utilization}%
        </span>
      </div>
      <div style={{ height: 8, borderRadius: 6, backgroundColor: colors.bgSubtle, overflow: 'hidden' }}>
        <div
          style={{
            width: `${Math.min(utilization, 100)}%`,
            height: '100%',
            backgroundColor: colors.primary,
            borderRadius: 6,
            transition: 'width 0.3s',
          }}
        />
      </div>
    </div>
  )
}
