import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import { useMeQuery } from '../../../features/auth/authApi'
import { useGetPropertyBookingsQuery } from '../../../features/laundry/laundryApi'
import type { AdminBookingsView } from '../../../features/laundry/types'
import { useAdminCancelBooking } from '../../../features/laundry/useAdminCancelBooking'
import { AdminBookingStats } from '../../../features/laundry/AdminBookingStats'
import { AdminBookingsList } from '../../../features/laundry/AdminBookingsList'
import { AdminBookingsCalendar } from '../../../features/laundry/AdminBookingsCalendar'
import { AdminCancelBookingModal } from '../../../features/laundry/AdminCancelBookingModal'
import { AdminPeriodNavigator } from '../../../features/laundry/AdminPeriodNavigator'
import { AdminBookingDetailPanel } from '../../../features/laundry/AdminBookingDetailPanel'
import { AdminRoomMachinesCard } from '../../../features/laundry/AdminRoomMachinesCard'
import { useGetPropertyQuery, BookingMode } from '../../../features/properties/propertiesApi'
import { useMediaQuery } from '../../../shared/utils/useMediaQuery'
import { MEDIA_XL } from '../../../shared/constants'
import { PageHeader, Spinner, SegmentedControl } from '../../../shared/ui'
import { todayStr, getWeekMonday, addDays } from '../../../shared/utils/dateUtils'
import { colors } from '../../../shared/theme'

// The overview always loads one bounded window at a time (never the full history),
// and the period navigator pages that window backward/forward through time.
const WINDOW_WEEKS = 4
const WINDOW_DAYS = WINDOW_WEEKS * 7

export function PropertyBookingsPage() {
  const { t } = useTranslation()
  const VIEW_SEGMENTS: { value: AdminBookingsView; label: string }[] = [
    { value: 'list', label: t('adminProperties.bookings.viewList') },
    { value: 'calendar', label: t('adminProperties.bookings.viewCalendar') },
  ]
  const { propertyId } = useParams<{ propertyId: string }>()
  const { data: user } = useMeQuery()
  const property = user?.memberships.find((m) => m.propertyId === propertyId)

  const today = useMemo(() => todayStr(), [])
  const currentWindowStart = useMemo(() => getWeekMonday(today), [today])

  const [windowStart, setWindowStart] = useState<string>(currentWindowStart)
  const [view, setView] = useState<AdminBookingsView>('list')
  const [pickedRoomId, setPickedRoomId] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const wide = useMediaQuery(MEDIA_XL)
  const { data: propertyDetail } = useGetPropertyQuery(propertyId!, { skip: !propertyId })
  const machineMode = propertyDetail?.settings.bookingMode === BookingMode.BookSpecificMachine

  const from = windowStart
  const to = useMemo(() => addDays(windowStart, WINDOW_DAYS - 1), [windowStart])
  const maxWeekStart = useMemo(() => addDays(windowStart, (WINDOW_WEEKS - 1) * 7), [windowStart])
  const isCurrent = windowStart === currentWindowStart

  const { data, isLoading, isFetching, isError } = useGetPropertyBookingsQuery(
    { propertyId: propertyId!, from, to },
    { skip: !propertyId },
  )

  const cancel = useAdminCancelBooking(propertyId)

  const bookings = data?.bookings ?? []
  const rooms = useMemo(() => data?.rooms ?? [], [data?.rooms])
  const activeRooms = useMemo(() => rooms.filter((r) => r.isActive), [rooms])
  const roomId = activeRooms.some((r) => r.id === pickedRoomId) ? pickedRoomId! : (activeRooms[0]?.id ?? '')
  const room = activeRooms.find((r) => r.id === roomId)
  // Derived from the loaded bookings, so a cancelled or paged-away booking simply drops out of the panel
  const selected = bookings.find((b) => b.id === selectedId) ?? null
  const panelBeside = wide && view === 'calendar' && activeRooms.length > 0

  if (isLoading) return <Spinner fullPage />

  return (
    <div className="p-4 p-lg-5">
      <PageHeader
        eyebrow={property?.propertyName}
        title={t('adminProperties.bookings.title')}
        description={t('adminProperties.bookings.description')}
      />

      {isError ? (
        <p style={{ color: colors.dangerText, fontSize: '0.9rem' }}>
          {t('adminProperties.bookings.loadError')}
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
            <AdminBookingsList bookings={bookings} today={today} onCancel={cancel.open} />
          ) : (
            <div className="d-flex gap-4 align-items-start">
              <div className="flex-grow-1" style={{ minWidth: 0 }}>
                <AdminBookingsCalendar
                  rooms={activeRooms}
                  bookings={bookings}
                  today={today}
                  weekStart={windowStart}
                  maxWeekStart={maxWeekStart}
                  roomId={roomId}
                  onSelectRoom={setPickedRoomId}
                  selectedBookingId={panelBeside ? selectedId : undefined}
                  onPick={panelBeside ? (b) => setSelectedId(b.id) : cancel.open}
                />
              </div>
              {panelBeside && (
                <aside className="d-flex flex-column gap-3 flex-shrink-0" style={{ width: 320 }}>
                  <AdminBookingDetailPanel booking={selected} today={today} onCancel={cancel.open} />
                  {room && <AdminRoomMachinesCard roomId={room.id} roomName={room.name} bookings={bookings} machineMode={machineMode} />}
                </aside>
              )}
            </div>
          )}
        </>
      )}

      {cancel.target && (
        <AdminCancelBookingModal
          target={cancel.target}
          cancelling={cancel.cancelling}
          error={cancel.error}
          onConfirm={cancel.confirm}
          onClose={cancel.close}
        />
      )}
    </div>
  )
}
