import { useState, useMemo, useEffect } from 'react'
import type { AdminBookingDto, AdminRoomSummaryDto } from './laundryApi'
import { useGetTimeSlotsQuery } from './laundryApi'
import { EmptyState, Spinner } from '../../shared/ui'
import { IconChevronLeft, IconChevronRight } from '../../shared/icons'
import { addDays, formatTime, isPast, dayShortLabel, dayNum, weekLabel } from '../../shared/utils/dateUtils'
import { colors } from '../../shared/theme'

interface Props {
  rooms: AdminRoomSummaryDto[]   // active rooms only
  bookings: AdminBookingDto[]
  today: string
  weekStart: string       // earliest selectable week (current week Monday)
  maxWeekStart: string    // latest selectable week Monday
  onCancel: (booking: AdminBookingDto) => void
}

export function AdminBookingsCalendar({ rooms, bookings, today, weekStart, maxWeekStart, onCancel }: Props) {
  const [selectedRoomId, setSelectedRoomId] = useState<string>(rooms[0]?.id ?? '')
  const [viewWeekStart, setViewWeekStart] = useState<string>(weekStart)

  // When the loaded period changes (batch paged), snap the week view back to its start.
  useEffect(() => setViewWeekStart(weekStart), [weekStart])

  const roomId = rooms.some((r) => r.id === selectedRoomId) ? selectedRoomId : (rooms[0]?.id ?? '')

  const { data: slots = [], isLoading } = useGetTimeSlotsQuery(roomId, { skip: !roomId })
  const activeSlots = useMemo(
    () => slots.filter((s) => s.isActive).slice().sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [slots],
  )

  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(viewWeekStart, i)), [viewWeekStart])

  const bookingByCell = useMemo(() => {
    const map = new Map<string, AdminBookingDto>()
    for (const b of bookings) {
      if (b.roomId === roomId) map.set(`${b.date}|${b.timeSlotTemplateId}`, b)
    }
    return map
  }, [bookings, roomId])

  const canGoBack = viewWeekStart > weekStart
  const canGoForward = viewWeekStart < maxWeekStart

  function shiftWeek(deltaDays: number) {
    const next = addDays(viewWeekStart, deltaDays)
    if (next < weekStart || next > maxWeekStart) return
    setViewWeekStart(next)
  }

  if (rooms.length === 0) {
    return <EmptyState title="Ingen aktive vaskerum" description="Aktivér et vaskerum for at se kalenderen." />
  }

  return (
    <div className="d-flex flex-column gap-3">
      {rooms.length > 1 && (
        <div className="d-flex gap-2 flex-wrap">
          {rooms.map((room) => {
            const active = room.id === roomId
            return (
              <button
                key={room.id}
                className="btn btn-sm"
                style={{
                  borderRadius: 20, fontSize: '0.78rem', padding: '3px 14px',
                  fontWeight: active ? 600 : 400,
                  backgroundColor: active ? colors.primary : colors.bgCard,
                  color: active ? '#ffffff' : colors.textSecondary,
                  border: `1px solid ${active ? colors.primary : colors.borderStrong}`,
                }}
                onClick={() => setSelectedRoomId(room.id)}
              >
                {room.name}
              </button>
            )
          })}
        </div>
      )}

      <div className="d-flex align-items-center justify-content-between">
        <button
          className="btn btn-sm p-1"
          style={{ color: canGoBack ? colors.textPrimary : colors.textDisabled, lineHeight: 1 }}
          disabled={!canGoBack}
          onClick={() => shiftWeek(-7)}
          aria-label="Forrige uge"
        >
          <IconChevronLeft size={16} />
        </button>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: colors.textPrimary }}>
          {weekLabel(viewWeekStart)}
        </span>
        <button
          className="btn btn-sm p-1"
          style={{ color: canGoForward ? colors.textPrimary : colors.textDisabled, lineHeight: 1 }}
          disabled={!canGoForward}
          onClick={() => shiftWeek(7)}
          aria-label="Næste uge"
        >
          <IconChevronRight size={16} />
        </button>
      </div>

      <div
        style={{
          border: `1px solid ${colors.borderDefault}`,
          borderRadius: 12,
          backgroundColor: colors.bgCard,
          overflowX: 'auto',
        }}
      >
        {isLoading ? (
          <Spinner />
        ) : activeSlots.length === 0 ? (
          <div style={{ padding: '32px 20px', textAlign: 'center', color: colors.textMuted, fontSize: '0.85rem' }}>
            Ingen tidspladser opsat for dette lokale.
          </div>
        ) : (
          <div style={{ minWidth: 640 }}>
            <CalendarHeader days={days} today={today} />
            {activeSlots.map((slot) => (
              <div key={slot.id} style={{ display: 'grid', gridTemplateColumns: '96px repeat(7, 1fr)', borderTop: `1px solid ${colors.borderRow}` }}>
                <div style={{ padding: '8px 10px', fontSize: '0.76rem', fontWeight: 500, color: colors.textSecondary, borderRight: `1px solid ${colors.borderRow}` }}>
                  {formatTime(slot.startTime)}
                </div>
                {days.map((date) => (
                  <Cell
                    key={date}
                    booking={bookingByCell.get(`${date}|${slot.id}`) ?? null}
                    past={isPast(date, slot.startTime, today)}
                    onCancel={onCancel}
                  />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function CalendarHeader({ days, today }: { days: string[]; today: string }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '96px repeat(7, 1fr)', backgroundColor: colors.bgHeader }}>
      <div style={{ borderRight: `1px solid ${colors.borderRow}` }} />
      {days.map((date) => {
        const isToday = date === today
        return (
          <div
            key={date}
            style={{
              padding: '8px 6px', textAlign: 'center', lineHeight: 1.25,
              color: date < today ? colors.textDisabled : colors.textPrimary,
              backgroundColor: isToday ? colors.primaryLighter : 'transparent',
            }}
          >
            <div style={{ fontSize: '0.68rem', textTransform: 'capitalize', color: colors.textMuted }}>
              {dayShortLabel(date, today)}
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: isToday ? 700 : 500 }}>{dayNum(date)}</div>
          </div>
        )
      })}
    </div>
  )
}

function Cell({ booking, past, onCancel }: { booking: AdminBookingDto | null; past: boolean; onCancel: (b: AdminBookingDto) => void }) {
  const base: React.CSSProperties = {
    padding: '6px 4px',
    borderRight: `1px solid ${colors.borderRow}`,
    minHeight: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }

  if (booking) {
    const label = booking.apartmentNumber ? `Lejl. ${booking.apartmentNumber}` : booking.residentName
    return (
      <div style={{ ...base, opacity: past ? 0.5 : 1 }}>
        <button
          className="btn p-0 w-100"
          title={`${booking.residentName} — klik for at aflyse`}
          onClick={() => onCancel(booking)}
          style={{
            fontSize: '0.72rem', fontWeight: 600, lineHeight: 1.2,
            color: colors.primary, backgroundColor: colors.primaryLight,
            border: `1px solid ${colors.primaryBorder}`, borderRadius: 6,
            padding: '4px 6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}
        >
          {label}
        </button>
      </div>
    )
  }

  return (
    <div style={{ ...base, opacity: past ? 0.4 : 1 }}>
      <span style={{ fontSize: '0.8rem', color: colors.textMuted }}>·</span>
    </div>
  )
}
