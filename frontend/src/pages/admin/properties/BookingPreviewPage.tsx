import { useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { PageHeader, EmptyState, Spinner } from '../../../shared/ui'
import { useGetLaundryRoomsQuery, useGetTimeSlotsQuery } from '../../../features/laundry/laundryApi'
import {
  useGetPropertyQuery,
  BookingVisibility,
  BookingMode,
  type ComplexSettingsDto,
} from '../../../features/properties/propertiesApi'
import { type GridBooking, BookingGrid } from '../../../features/laundry/BookingGrid'
import { IconChevronLeft, IconChevronRight } from '../../../shared/icons'

// ── Types ──────────────────────────────────────────────────────────────────────

interface PreviewBooking {
  slotId: string
  date: string    // "YYYY-MM-DD"
  userId: string
  roomId: string
}

type PendingAction = { type: 'book' | 'cancel'; slotId: string }

// ── Preview users ──────────────────────────────────────────────────────────────

const PREVIEW_USERS = [
  { id: 'user-a', name: 'Anna Hansen',    apartment: '1A' },
  { id: 'user-b', name: 'Bo Pedersen',    apartment: '2B' },
  { id: 'user-c', name: 'Camilla Larsen', apartment: '3C' },
] as const

type PreviewUserId = typeof PREVIEW_USERS[number]['id']

// ── Date helpers ───────────────────────────────────────────────────────────────

function getTodayStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function addDays(dateStr: string, n: number): string {
  const parts = dateStr.split('-').map(Number)
  const d = new Date(parts[0] ?? 2025, (parts[1] ?? 1) - 1, (parts[2] ?? 1) + n)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Returns the Monday of the week containing dateStr. */
function getWeekMonday(dateStr: string): string {
  const parts = dateStr.split('-').map(Number)
  const d = new Date(parts[0] ?? 2025, (parts[1] ?? 1) - 1, parts[2] ?? 1)
  const dow = d.getDay() // 0=Sun
  const daysToMonday = dow === 0 ? -6 : 1 - dow
  return addDays(dateStr, daysToMonday)
}

const DAY_SHORT  = ['sø', 'ma', 'ti', 'on', 'to', 'fr', 'lø'] as const
const DAY_FULL   = ['søndag', 'mandag', 'tirsdag', 'onsdag', 'torsdag', 'fredag', 'lørdag'] as const
const MONTH_SHORT = ['jan','feb','mar','apr','maj','jun','jul','aug','sep','okt','nov','dec'] as const

function dateParts(dateStr: string): { short: string; dayNum: number; fullLabel: string } {
  const parts = dateStr.split('-').map(Number)
  const d = new Date(parts[0] ?? 2025, (parts[1] ?? 1) - 1, parts[2] ?? 1)
  return {
    short:     DAY_SHORT[d.getDay()]  ?? 'ma',
    dayNum:    d.getDate(),
    fullLabel: `${DAY_FULL[d.getDay()] ?? ''} ${d.getDate()}. ${MONTH_SHORT[d.getMonth()] ?? ''}`,
  }
}

function formatTime(t: string): string { return t.slice(0, 5) }

function canCancelBooking(date: string, startTime: string, windowMinutes: number): boolean {
  const parts = startTime.split(':').map(Number)
  const slotDate = new Date(
    parseInt(date.slice(0, 4)),
    parseInt(date.slice(5, 7)) - 1,
    parseInt(date.slice(8, 10)),
    parts[0] ?? 0,
    parts[1] ?? 0,
    0, 0,
  )
  return new Date() < new Date(slotDate.getTime() - windowMinutes * 60_000)
}

// ── Page ───────────────────────────────────────────────────────────────────────

export function BookingPreviewPage() {
  const { propertyId } = useParams<{ propertyId: string }>()
  const pid = propertyId ?? ''

  const { data: rooms = [],  isLoading: roomsLoading    } = useGetLaundryRoomsQuery(pid)
  const { data: property,   isLoading: propertyLoading  } = useGetPropertyQuery(pid)

  const todayStr      = useMemo(() => getTodayStr(), [])
  const thisWeekMon   = useMemo(() => getWeekMonday(todayStr), [todayStr])

  const [activeUserId,    setActiveUserId]    = useState<PreviewUserId>('user-a')
  const [previewBookings, setPreviewBookings] = useState<PreviewBooking[]>([])
  const [selectedDate,    setSelectedDate]    = useState<string>(todayStr)
  const [weekStart,       setWeekStart]       = useState<string>(thisWeekMon)
  const [selectedRoomId,  setSelectedRoomId]  = useState<string | null>(null)
  const [pendingAction,   setPendingAction]   = useState<PendingAction | null>(null)

  const effectiveRoomId = selectedRoomId ?? (rooms.find((r) => r.isActive)?.id ?? null)

  const { data: slots = [], isLoading: slotsLoading } = useGetTimeSlotsQuery(
    effectiveRoomId ?? '',
    { skip: effectiveRoomId === null },
  )

  const settings   = property?.settings
  const activeSlots = useMemo(() => slots.filter((s) => s.isActive), [slots])

  // ── gridBookings ──────────────────────────────────────────────────────────────

  const gridBookings = useMemo((): GridBooking[] => {
    if (!settings || effectiveRoomId === null) return []
    return previewBookings
      .filter((b) => b.date === selectedDate && b.roomId === effectiveRoomId)
      .map((b) => {
        const isOwn = b.userId === activeUserId
        const slot  = activeSlots.find((s) => s.id === b.slotId)
        if (isOwn) {
          return {
            slotId: b.slotId,
            isOwn: true,
            label: 'Min booking',
            canCancel: slot
              ? canCancelBooking(b.date, slot.startTime, settings.cancellationWindowMinutes)
              : false,
          }
        }
        const user = PREVIEW_USERS.find((u) => u.id === b.userId)
        let label: string
        switch (settings.bookingVisibility) {
          case BookingVisibility.FullName:      label = user?.name ?? 'Beboer';             break
          case BookingVisibility.ApartmentOnly: label = user ? `Lejl. ${user.apartment}` : 'Beboer'; break
          default:                              label = 'Optaget'
        }
        return { slotId: b.slotId, isOwn: false, label, canCancel: false }
      })
  }, [previewBookings, selectedDate, effectiveRoomId, activeUserId, settings, activeSlots])

  // ── maxReached ────────────────────────────────────────────────────────────────

  const maxReached = useMemo(() => {
    if (!settings) return false
    const count = previewBookings.filter(
      (b) => b.userId === activeUserId && b.date >= todayStr,
    ).length
    return count >= settings.maxConcurrentBookingsPerUser
  }, [previewBookings, activeUserId, todayStr, settings])

  // ── Confirmation flow ─────────────────────────────────────────────────────────

  function handleBook(slotId: string) {
    if (effectiveRoomId === null) return
    setPendingAction({ type: 'book', slotId })
  }

  function handleCancel(slotId: string) {
    setPendingAction({ type: 'cancel', slotId })
  }

  function handleConfirm() {
    if (!pendingAction || effectiveRoomId === null) return
    const { type, slotId } = pendingAction
    setPendingAction(null)
    if (type === 'book') {
      const dup = previewBookings.some(
        (b) => b.slotId === slotId && b.date === selectedDate && b.userId === activeUserId,
      )
      if (!dup) {
        setPreviewBookings((prev) => [
          ...prev,
          { slotId, date: selectedDate, userId: activeUserId, roomId: effectiveRoomId },
        ])
      }
    } else {
      setPreviewBookings((prev) =>
        prev.filter(
          (b) => !(b.slotId === slotId && b.date === selectedDate && b.userId === activeUserId),
        ),
      )
    }
  }

  // ── Date strip — full week Mon–Sun ────────────────────────────────────────────

  const visibleDates = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  )

  const canGoBack    = weekStart > thisWeekMon
  const lookaheadEnd = settings ? addDays(todayStr, settings.bookingLookaheadDays) : null

  function shiftWeek(n: number) {
    const next = addDays(weekStart, n)
    if (next < thisWeekMon) return
    setWeekStart(next)
    setSelectedDate((prev) => {
      const newEnd = addDays(next, 6)
      if (prev >= next && prev <= newEnd) return prev
      return next
    })
  }

  // ── Loading / empty ───────────────────────────────────────────────────────────

  if (roomsLoading || propertyLoading) {
    return <div className="p-4"><Spinner /></div>
  }

  const activeRooms  = rooms.filter((r) => r.isActive)
  const selectedRoom = activeRooms.find((r) => r.id === effectiveRoomId)

  if (activeRooms.length === 0) {
    return (
      <div className="p-4">
        <PageHeader title="Forhåndsvisning" description="Simulér beboernes bookingoplevelse" />
        <EmptyState
          title="Ingen aktive vaskerum"
          description="Opret et vaskerum under Lokaler & Maskiner for at se forhåndsvisningen."
        />
      </div>
    )
  }

  // Slot for the pending action (for modal display)
  const pendingSlot = pendingAction
    ? activeSlots.find((s) => s.id === pendingAction.slotId)
    : null
  const activeUser = PREVIEW_USERS.find((u) => u.id === activeUserId)

  return (
    <div className="p-3 p-md-4" style={{ maxWidth: 700 }}>

      <PageHeader
        title="Forhåndsvisning"
        description="Simulér beboernes bookingoplevelse med testbrugere"
      />

      {/* ── Admin control panel ───────────────────────────────────────────────── */}
      <div
        className="rounded-3 mb-4 p-3"
        style={{
          backgroundColor: '#f0f5ff',
          border: '1px solid #c5d9fb',
          borderLeft: '4px solid #1565c0',
        }}
      >
        <div className="d-flex align-items-center justify-content-between mb-3">
          <span
            style={{
              fontSize: '0.7rem', fontWeight: 700, color: '#1565c0',
              textTransform: 'uppercase', letterSpacing: '0.09em',
            }}
          >
            Admin · Simuleringsindstillinger
          </span>
          {previewBookings.length > 0 && (
            <button
              className="btn btn-sm btn-outline-secondary"
              style={{ borderRadius: 7, fontSize: '0.78rem', padding: '2px 12px' }}
              onClick={() => setPreviewBookings([])}
            >
              Nulstil
            </button>
          )}
        </div>

        {/* Settings */}
        {settings && <SettingsStrip settings={settings} />}

        {/* User selector */}
        <div className="d-flex align-items-center gap-2 flex-wrap mb-2">
          <span style={{ fontSize: '0.8rem', color: '#3d5a8a', fontWeight: 600, minWidth: 74 }}>
            Viser som:
          </span>
          <div className="d-flex gap-2 flex-wrap">
            {PREVIEW_USERS.map((u) => {
              const active = u.id === activeUserId
              return (
                <button
                  key={u.id}
                  className="btn btn-sm"
                  style={{
                    borderRadius: 20,
                    fontSize: '0.78rem',
                    padding: '3px 14px',
                    fontWeight: active ? 600 : 400,
                    backgroundColor: active ? '#1565c0' : '#dce8ff',
                    color:           active ? '#ffffff' : '#3d5a8a',
                    border: 'none',
                  }}
                  onClick={() => setActiveUserId(u.id)}
                >
                  {u.name}
                  <span style={{ opacity: 0.75, marginLeft: 5 }}>({u.apartment})</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Room selector */}
        {activeRooms.length > 1 && (
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <span style={{ fontSize: '0.8rem', color: '#3d5a8a', fontWeight: 600, minWidth: 74 }}>
              Vaskerum:
            </span>
            <div className="d-flex gap-2 flex-wrap">
              {activeRooms.map((room) => {
                const active = room.id === effectiveRoomId
                return (
                  <button
                    key={room.id}
                    className="btn btn-sm"
                    style={{
                      borderRadius: 20,
                      fontSize: '0.78rem',
                      padding: '3px 14px',
                      fontWeight: active ? 600 : 400,
                      backgroundColor: active ? '#1565c0' : '#dce8ff',
                      color:           active ? '#ffffff' : '#3d5a8a',
                      border: 'none',
                    }}
                    onClick={() => setSelectedRoomId(room.id)}
                  >
                    {room.name}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Preview area ──────────────────────────────────────────────────────── */}
      <div>

        {/* Section label */}
        <div className="d-flex align-items-center gap-2 mb-2">
          <span
            style={{
              fontSize: '0.7rem', fontWeight: 700, color: '#a0adb8',
              textTransform: 'uppercase', letterSpacing: '0.09em',
            }}
          >
            Beboervisning
          </span>
          {selectedRoom && (
            <span style={{ fontSize: '0.82rem', color: '#5a6a7a', fontWeight: 500 }}>
              — {selectedRoom.name}
            </span>
          )}
        </div>

        {/* Date strip */}
        <div
          className="d-flex align-items-center gap-1 mb-3 p-2 rounded-3"
          style={{ backgroundColor: '#f8fafb', border: '1px solid #e8ecf0' }}
        >
          <button
            className="btn btn-sm p-1 flex-shrink-0"
            style={{ color: canGoBack ? '#0d1b2a' : '#c8d4de', lineHeight: 1 }}
            disabled={!canGoBack}
            onClick={() => shiftWeek(-7)}
            aria-label="Forrige uge"
          >
            <IconChevronLeft size={15} />
          </button>

          <div
            className="d-flex flex-grow-1 justify-content-between"
            style={{ gap: 2, overflowX: 'auto' }}
          >
            {visibleDates.map((date) => {
              const { short, dayNum } = dateParts(date)
              const isSelected = date === selectedDate
              const isPast     = date < todayStr
              const isLocked   = lookaheadEnd !== null && date > lookaheadEnd
              const isDimmed   = isPast || isLocked

              return (
                <button
                  key={date}
                  className="btn d-flex flex-column align-items-center flex-shrink-0"
                  style={{
                    borderRadius: 8,
                    padding: '4px 6px',
                    minWidth: 36,
                    lineHeight: 1.25,
                    fontWeight: isSelected ? 700 : 400,
                    backgroundColor: isSelected ? '#1565c0' : 'transparent',
                    color: isSelected ? '#ffffff' : isDimmed ? '#c8d4de' : '#0d1b2a',
                    border: 'none',
                    fontSize: '0.72rem',
                    cursor: 'pointer',
                  }}
                  onClick={() => setSelectedDate(date)}
                >
                  <span style={{ textTransform: 'capitalize' }}>{short}</span>
                  <span style={{ fontSize: '0.88rem', fontWeight: isSelected ? 700 : 500 }}>{dayNum}</span>
                </button>
              )
            })}
          </div>

          <button
            className="btn btn-sm p-1 flex-shrink-0"
            style={{ color: '#0d1b2a', lineHeight: 1 }}
            onClick={() => shiftWeek(7)}
            aria-label="Næste uge"
          >
            <IconChevronRight size={15} />
          </button>
        </div>

        {/* Booking grid */}
        <div className="rounded-3 overflow-hidden" style={{ border: '1px solid #e8ecf0' }}>
          {slotsLoading ? (
            <div className="p-4 text-center"><Spinner /></div>
          ) : (
            <BookingGrid
              slots={activeSlots}
              date={selectedDate}
              today={todayStr}
              bookingLookaheadDays={settings?.bookingLookaheadDays ?? 7}
              gridBookings={gridBookings}
              maxReached={maxReached}
              onBook={handleBook}
              onCancel={handleCancel}
            />
          )}
        </div>

        {/* Active user summary */}
        <UserBookingSummary
          userId={activeUserId}
          previewBookings={previewBookings}
          todayStr={todayStr}
          maxConcurrent={settings?.maxConcurrentBookingsPerUser ?? 0}
        />

      </div>

      {/* ── Confirmation modal ────────────────────────────────────────────────── */}
      {pendingAction && pendingSlot && (
        <ConfirmModal
          type={pendingAction.type}
          slotTime={`${formatTime(pendingSlot.startTime)} – ${formatTime(pendingSlot.endTime)}`}
          dateLabel={dateParts(selectedDate).fullLabel}
          userName={activeUser?.name ?? 'Beboer'}
          onConfirm={handleConfirm}
          onClose={() => setPendingAction(null)}
        />
      )}

    </div>
  )
}

// ── SettingsStrip ──────────────────────────────────────────────────────────────

function SettingsStrip({ settings }: { settings: ComplexSettingsDto }) {
  const visibilityLabel = {
    [BookingVisibility.FullName]:      'Navn synligt',
    [BookingVisibility.ApartmentOnly]: 'Lejl. nr.',
    [BookingVisibility.Anonymous]:     'Anonymt',
  }[settings.bookingVisibility] ?? 'Lejl. nr.'

  const modeLabel = settings.bookingMode === BookingMode.BookSpecificMachine
    ? 'Specifik maskine'
    : 'Hel lokale'

  const cancelLabel = settings.cancellationWindowMinutes >= 60
    ? `Aflys inden ${settings.cancellationWindowMinutes / 60}t`
    : `Aflys inden ${settings.cancellationWindowMinutes} min`

  const chips = [
    `Max ${settings.maxConcurrentBookingsPerUser} booking`,
    cancelLabel,
    visibilityLabel,
    `${settings.bookingLookaheadDays} dage frem`,
    modeLabel,
  ]

  return (
    <div className="d-flex flex-wrap gap-2 mb-3 align-items-center">
      {chips.map((label) => (
        <span
          key={label}
          style={{
            padding: '2px 10px',
            borderRadius: 20,
            backgroundColor: '#dce8ff',
            color: '#2c4f8c',
            fontSize: '0.74rem',
            fontWeight: 500,
            border: '1px solid #b8d0f8',
          }}
        >
          {label}
        </span>
      ))}
    </div>
  )
}

// ── ConfirmModal ───────────────────────────────────────────────────────────────

function ConfirmModal({
  type,
  slotTime,
  dateLabel,
  userName,
  onConfirm,
  onClose,
}: {
  type: 'book' | 'cancel'
  slotTime: string
  dateLabel: string
  userName: string
  onConfirm: () => void
  onClose: () => void
}) {
  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed', inset: 0,
          backgroundColor: 'rgba(0,0,0,0.35)',
          zIndex: 1050,
        }}
        onClick={onClose}
      />

      {/* Dialog */}
      <div
        style={{
          position: 'fixed',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: '#ffffff',
          borderRadius: 12,
          padding: '24px',
          width: 320,
          maxWidth: 'calc(100vw - 32px)',
          zIndex: 1051,
          boxShadow: '0 8px 40px rgba(0,0,0,0.15)',
        }}
      >
        <h6 style={{ fontWeight: 700, color: '#0d1b2a', marginBottom: 6, fontSize: '1rem' }}>
          {type === 'book' ? 'Bekræft booking' : 'Bekræft aflysning'}
        </h6>

        <p style={{ fontSize: '0.88rem', color: '#5a6a7a', marginBottom: 6, lineHeight: 1.5 }}>
          {type === 'book' ? (
            <>
              Book <strong>{slotTime}</strong> den {dateLabel} som <strong>{userName}</strong>?
            </>
          ) : (
            <>
              Aflys booking <strong>{slotTime}</strong> den {dateLabel}?
            </>
          )}
        </p>

        <p style={{ fontSize: '0.76rem', color: '#a0adb8', marginBottom: 20 }}>
          Dette er en preview — ingen rigtige bookinger oprettes.
        </p>

        <div className="d-flex gap-2 justify-content-end">
          <button
            className="btn btn-sm btn-outline-secondary"
            style={{ borderRadius: 7, fontSize: '0.82rem' }}
            onClick={onClose}
          >
            Annuller
          </button>
          <button
            className={`btn btn-sm ${type === 'book' ? 'btn-primary' : 'btn-danger'}`}
            style={{ borderRadius: 7, fontSize: '0.82rem' }}
            onClick={onConfirm}
          >
            {type === 'book' ? 'Book' : 'Aflys'}
          </button>
        </div>
      </div>
    </>
  )
}

// ── UserBookingSummary ─────────────────────────────────────────────────────────

function UserBookingSummary({
  userId,
  previewBookings,
  todayStr,
  maxConcurrent,
}: {
  userId: PreviewUserId
  previewBookings: PreviewBooking[]
  todayStr: string
  maxConcurrent: number
}) {
  const user     = PREVIEW_USERS.find((u) => u.id === userId)
  const upcoming = previewBookings.filter((b) => b.userId === userId && b.date >= todayStr)
  if (upcoming.length === 0) return null

  return (
    <div
      className="mt-3 p-3 rounded-3 d-flex align-items-center gap-2"
      style={{ backgroundColor: '#f0fdf4', border: '1px solid #c8e6c9', fontSize: '0.82rem' }}
    >
      <span style={{ fontWeight: 600, color: '#2e7d32' }}>
        {user?.name ?? 'Beboer'} har {upcoming.length} aktiv{upcoming.length === 1 ? '' : 'e'} booking{upcoming.length === 1 ? '' : 'er'}
      </span>
      {maxConcurrent > 0 && (
        <span style={{ color: '#5a6a7a' }}>
          (maks. {maxConcurrent})
        </span>
      )}
    </div>
  )
}
