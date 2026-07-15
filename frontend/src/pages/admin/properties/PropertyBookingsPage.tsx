import { useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useMeQuery } from '../../../features/auth/authApi'
import {
  useGetPropertyBookingsQuery,
  useCancelBookingMutation,
  type AdminBookingDto,
} from '../../../features/laundry/laundryApi'
import type { AdminBookingsView, AdminCancelTarget } from '../../../features/laundry/types'
import { AdminBookingStats } from '../../../features/laundry/AdminBookingStats'
import { AdminBookingsList } from '../../../features/laundry/AdminBookingsList'
import { AdminBookingsCalendar } from '../../../features/laundry/AdminBookingsCalendar'
import { AdminCancelBookingModal } from '../../../features/laundry/AdminCancelBookingModal'
import { AdminPeriodNavigator } from '../../../features/laundry/AdminPeriodNavigator'
import { PageHeader, Spinner, SegmentedControl } from '../../../shared/ui'
import { todayStr, getWeekMonday, addDays, formatDateFull, formatTimeRange } from '../../../shared/utils/dateUtils'
import { colors } from '../../../shared/theme'

// The overview always loads one bounded window at a time (never the full history),
// and the period navigator pages that window backward/forward through time.
const WINDOW_WEEKS = 4
const WINDOW_DAYS = WINDOW_WEEKS * 7

const VIEW_SEGMENTS: { value: AdminBookingsView; label: string }[] = [
  { value: 'list', label: 'Liste' },
  { value: 'calendar', label: 'Kalender' },
]

export function PropertyBookingsPage() {
  const { propertyId } = useParams<{ propertyId: string }>()
  const { data: user } = useMeQuery()
  const property = user?.memberships.find((m) => m.propertyId === propertyId)

  const today = useMemo(() => todayStr(), [])
  const currentWindowStart = useMemo(() => getWeekMonday(today), [today])

  const [windowStart, setWindowStart] = useState<string>(currentWindowStart)
  const [view, setView] = useState<AdminBookingsView>('list')
  const [cancelTarget, setCancelTarget] = useState<AdminCancelTarget | null>(null)
  const [cancelError, setCancelError] = useState<string | null>(null)

  const from = windowStart
  const to = useMemo(() => addDays(windowStart, WINDOW_DAYS - 1), [windowStart])
  const maxWeekStart = useMemo(() => addDays(windowStart, (WINDOW_WEEKS - 1) * 7), [windowStart])
  const isCurrent = windowStart === currentWindowStart

  const { data, isLoading, isFetching, isError } = useGetPropertyBookingsQuery(
    { propertyId: propertyId!, from, to },
    { skip: !propertyId },
  )

  const [cancelBooking, { isLoading: cancelling }] = useCancelBookingMutation()

  const bookings = data?.bookings ?? []
  const rooms = data?.rooms ?? []
  const activeRooms = useMemo(() => rooms.filter((r) => r.isActive), [rooms])

  function openCancel(b: AdminBookingDto) {
    setCancelError(null)
    setCancelTarget({
      bookingId: b.id,
      roomId: b.roomId,
      roomName: b.roomName,
      residentName: b.residentName,
      dateLabel: formatDateFull(b.date),
      slotTime: formatTimeRange(b.startTime, b.endTime),
    })
  }

  async function confirmCancel() {
    if (!cancelTarget || !propertyId) return
    try {
      await cancelBooking({
        bookingId: cancelTarget.bookingId,
        roomId: cancelTarget.roomId,
        propertyId,
      }).unwrap()
      setCancelTarget(null)
    } catch {
      setCancelError('Bookingen kunne ikke aflyses. Prøv igen.')
    }
  }

  if (isLoading) return <Spinner fullPage />

  return (
    <div className="p-4 p-lg-5">
      <PageHeader
        eyebrow={property?.propertyName}
        title="Bookinger"
        description="Oversigt over alle bookinger i ejendommen."
      />

      {isError ? (
        <p style={{ color: colors.dangerText, fontSize: '0.9rem' }}>
          Kunne ikke indlæse bookinger. Prøv at genindlæse siden.
        </p>
      ) : (
        <>
          <AdminPeriodNavigator
            from={from}
            to={to}
            isCurrent={isCurrent}
            loading={isFetching}
            onPrev={() => setWindowStart((w) => addDays(w, -WINDOW_DAYS))}
            onNext={() => setWindowStart((w) => addDays(w, WINDOW_DAYS))}
            onJumpToToday={() => setWindowStart(currentWindowStart)}
          />

          <AdminBookingStats bookings={bookings} rooms={rooms} periodDays={WINDOW_DAYS} />

          <div style={{ maxWidth: 320, marginBottom: 20 }}>
            <SegmentedControl segments={VIEW_SEGMENTS} value={view} onChange={setView} />
          </div>

          {view === 'list' ? (
            <AdminBookingsList bookings={bookings} today={today} onCancel={openCancel} />
          ) : (
            <AdminBookingsCalendar
              rooms={activeRooms}
              bookings={bookings}
              today={today}
              weekStart={windowStart}
              maxWeekStart={maxWeekStart}
              onCancel={openCancel}
            />
          )}
        </>
      )}

      {cancelTarget && (
        <AdminCancelBookingModal
          target={cancelTarget}
          cancelling={cancelling}
          error={cancelError}
          onConfirm={confirmCancel}
          onClose={() => setCancelTarget(null)}
        />
      )}
    </div>
  )
}
