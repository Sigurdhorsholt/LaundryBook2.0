import { useState, useMemo, useEffect } from 'react'
import { skipToken } from '@reduxjs/toolkit/query/react'
import { useMeQuery } from '../../features/auth/authApi'
import { useGetPropertyQuery } from '../../features/properties/propertiesApi'
import {
  useGetLaundryRoomsQuery,
  useGetTimeSlotsQuery,
  useGetBookingsQuery,
  useGetMyBookingsQuery,
  useCreateBookingMutation,
  useCancelBookingMutation,
} from '../../features/laundry/laundryApi'
import type { MyBookingDto } from '../../features/laundry/laundryApi'
import { BookingGrid } from '../../features/laundry/BookingGrid'
import type { GridBooking } from '../../features/laundry/BookingGrid'

// ── Date helpers ───────────────────────────────────────────────────────────────

function todayStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function addDays(dateStr: string, n: number): string {
  const parts = dateStr.split('-').map(Number)
  const d = new Date(parts[0] ?? 2025, (parts[1] ?? 1) - 1, (parts[2] ?? 1) + n)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getWeekMonday(dateStr: string): string {
  const parts = dateStr.split('-').map(Number)
  const d = new Date(parts[0] ?? 2025, (parts[1] ?? 1) - 1, parts[2] ?? 1)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const DAY_SHORT   = ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn']
const MONTH_SHORT = ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec']

// Task 1 — "I dag" / "I morgen" language
function dayShortLabel(dateStr: string, today: string): string {
  if (dateStr === today)             return 'I dag'
  if (dateStr === addDays(today, 1)) return 'I morgen'
  const parts = dateStr.split('-').map(Number)
  const d = new Date(parts[0] ?? 2025, (parts[1] ?? 1) - 1, parts[2] ?? 1)
  const dow = d.getDay()
  return DAY_SHORT[dow === 0 ? 6 : dow - 1] ?? ''
}

function dayNum(dateStr: string): number {
  return parseInt(dateStr.slice(8), 10)
}

function formatDateFull(dateStr: string): string {
  const parts = dateStr.split('-').map(Number)
  const d = new Date(parts[0] ?? 2025, (parts[1] ?? 1) - 1, parts[2] ?? 1)
  const dow = d.getDay()
  const dayNames = ['Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag', 'Søndag']
  return `${dayNames[dow === 0 ? 6 : dow - 1] ?? ''} ${d.getDate()}. ${MONTH_SHORT[d.getMonth()] ?? ''}`
}

function formatTimeRange(start: string, end: string): string {
  return `${start.slice(0, 5)}–${end.slice(0, 5)}`
}

function weekLabel(weekStart: string): string {
  const parts = weekStart.split('-').map(Number)
  const d = new Date(parts[0] ?? 2025, (parts[1] ?? 1) - 1, parts[2] ?? 1)
  const jan4 = new Date(d.getFullYear(), 0, 4)
  const diff = (d.getTime() - jan4.getTime()) / 86400000
  return `Uge ${Math.ceil((diff + jan4.getDay() + 1) / 7)}`
}

// Task 8 — minutes until a slot starts
function minutesUntilSlot(date: string, startTime: string): number {
  const parts = startTime.split(':').map(Number)
  const d = new Date(
    parseInt(date.slice(0, 4)),
    parseInt(date.slice(5, 7)) - 1,
    parseInt(date.slice(8, 10)),
    parts[0] ?? 0, parts[1] ?? 0, 0, 0,
  )
  return Math.floor((d.getTime() - Date.now()) / 60_000)
}

// Task 10 — booking count for routine acknowledgment
function getBookingCount(): number {
  return parseInt(localStorage.getItem('laundryBookingCount') ?? '0', 10)
}
function incrementBookingCount(): number {
  const next = getBookingCount() + 1
  localStorage.setItem('laundryBookingCount', String(next))
  return next
}

// Task 2 — dot colors
const DOT_COLOR: Record<string, string> = {
  free: '#4caf50', few: '#f59e0b', full: '#e0e0e0', past: 'transparent',
}

// ── Types ──────────────────────────────────────────────────────────────────────

type PendingAction = {
  type: 'book' | 'cancel'
  slotId: string
  date: string
  slotTime: string
  bookingId?: string
  minutesUntil?: number  // Task 8
}

function extractErrorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'data' in err) {
    const data = (err as { data?: { title?: string } }).data
    if (data?.title) return data.title
  }
  return 'Der opstod en fejl. Prøv igen.'
}

// ── Component ──────────────────────────────────────────────────────────────────

export function LaundryPage() {
  const today = todayStr()
  const [weekStart, setWeekStart]       = useState(() => getWeekMonday(today))
  const [selectedDate, setSelectedDate] = useState(today)
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null)
  const [pending, setPending]           = useState<PendingAction | null>(null)
  const [confirmError, setConfirmError] = useState<string | null>(null)
  const [milestoneCount, setMilestoneCount] = useState<number | null>(null) // Task 10

  const { data: me } = useMeQuery()
  const propertyId = me?.memberships[0]?.propertyId ?? null

  const { data: property } = useGetPropertyQuery(propertyId ?? skipToken)
  const settings = property?.settings

  const { data: rooms, isLoading: roomsLoading } = useGetLaundryRoomsQuery(propertyId ?? skipToken)

  useEffect(() => {
    if (rooms && rooms.length > 0 && selectedRoomId === null) {
      setSelectedRoomId(rooms[0]?.id ?? null)
    }
  }, [rooms, selectedRoomId])

  const weekFrom = weekStart
  const weekTo   = addDays(weekStart, 6)

  const { data: slots, isLoading: slotsLoading } = useGetTimeSlotsQuery(selectedRoomId ?? skipToken)

  const { data: bookings, isLoading: bookingsLoading } = useGetBookingsQuery(
    selectedRoomId ? { roomId: selectedRoomId, from: weekFrom, to: weekTo } : skipToken
  )

  const { data: myBookings } = useGetMyBookingsQuery(propertyId ?? skipToken)

  const [createBooking, { isLoading: creating }] = useCreateBookingMutation()
  const [cancelBooking, { isLoading: cancelling }] = useCancelBookingMutation()

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  )

  const gridBookings = useMemo((): GridBooking[] =>
    (bookings ?? [])
      .filter(b => b.date === selectedDate)
      .map(b => ({ slotId: b.timeSlotTemplateId, isOwn: b.isOwn, label: b.label, canCancel: b.canCancel }))
  , [bookings, selectedDate])

  const maxReached =
    (myBookings?.filter(b => b.date >= today).length ?? 0) >=
    (settings?.maxConcurrentBookingsPerUser ?? 2)

  // Task 2 — availability per date for dots
  const availabilityByDate = useMemo((): Record<string, 'free' | 'few' | 'full' | 'past'> => {
    const result: Record<string, 'free' | 'few' | 'full' | 'past'> = {}
    const lookaheadEnd = settings ? addDays(today, settings.bookingLookaheadDays) : null
    const totalSlots = (slots ?? []).length
    for (const d of weekDays) {
      if (d < today || (lookaheadEnd !== null && d > lookaheadEnd)) {
        result[d] = 'past'
        continue
      }
      const bookedCount = (bookings ?? []).filter(b => b.date === d).length
      const free = totalSlots - bookedCount
      result[d] = free === 0 ? 'full' : free <= 2 ? 'few' : 'free'
    }
    return result
  }, [weekDays, bookings, slots, today, settings])

  // Task 9 — social context count
  const othersBookedToday = useMemo(
    () => (bookings ?? []).filter(b => b.date === selectedDate && !b.isOwn).length
  , [bookings, selectedDate])

  const todayWeekMonday = getWeekMonday(today)
  const canGoBack = weekStart > todayWeekMonday

  function shiftWeek(delta: number) {
    const newStart = addDays(weekStart, delta * 7)
    setWeekStart(newStart)
    const newEnd = addDays(newStart, 6)
    if (selectedDate < newStart || selectedDate > newEnd) {
      setSelectedDate(delta > 0 ? newStart : newEnd)
    }
  }

  // ── Booking handlers ─────────────────────────────────────────────────────────

  function handleBook(slotId: string) {
    const slot = slots?.find(s => s.id === slotId)
    if (!slot) return
    setPending({ type: 'book', slotId, date: selectedDate, slotTime: formatTimeRange(slot.startTime, slot.endTime) })
    setConfirmError(null)
  }

  function handleCancel(slotId: string) {
    const b = myBookings?.find(m => m.timeSlotTemplateId === slotId && m.date === selectedDate)
    if (!b) return
    setPending({
      type: 'cancel', slotId, date: selectedDate,
      slotTime: formatTimeRange(b.startTime, b.endTime),
      bookingId: b.id,
      minutesUntil: minutesUntilSlot(selectedDate, b.startTime), // Task 8
    })
    setConfirmError(null)
  }

  function handleCancelUpcoming(b: MyBookingDto) {
    setPending({
      type: 'cancel', slotId: b.timeSlotTemplateId, date: b.date,
      slotTime: formatTimeRange(b.startTime, b.endTime),
      bookingId: b.id,
      minutesUntil: minutesUntilSlot(b.date, b.startTime), // Task 8
    })
    setConfirmError(null)
  }

  async function handleConfirm() {
    if (!pending || !propertyId) return
    try {
      if (pending.type === 'book') {
        if (!selectedRoomId) return
        await createBooking({
          roomId: selectedRoomId, propertyId,
          timeSlotTemplateId: pending.slotId, date: pending.date,
        }).unwrap()
        // Task 10 — routine acknowledgment
        const newCount = incrementBookingCount()
        if (newCount % 5 === 0) {
          setMilestoneCount(newCount)
          setTimeout(() => setMilestoneCount(null), 4000)
        }
      } else {
        if (!pending.bookingId) return
        const roomId = selectedRoomId ?? myBookings?.find(m => m.id === pending.bookingId)?.roomId
        if (!roomId) return
        await cancelBooking({ bookingId: pending.bookingId, roomId, propertyId }).unwrap()
      }
      setPending(null)
    } catch (err) {
      setConfirmError(extractErrorMessage(err))
    }
  }

  // ── No property ───────────────────────────────────────────────────────────────

  if (!propertyId) {
    return (
      <div className="container-xl px-4 py-5">
        <h1 className="fw-bold mb-2" style={{ fontSize: '1.75rem', color: '#0d1b2a' }}>Vaskebooking</h1>
        <p style={{ color: '#5a6a7a' }}>Du er ikke tilknyttet nogen ejendom endnu.</p>
      </div>
    )
  }

  const gridLoading = slotsLoading || bookingsLoading

  return (
    <div className="container-xl px-4 py-5">

      {/* ── Header ─────────────────────────────────────────────────────────────── */}
      <h1 className="fw-bold mb-1" style={{ fontSize: '1.75rem', color: '#0d1b2a' }}>
        Vaskebooking
      </h1>
      <p className="mb-4" style={{ color: '#5a6a7a', fontSize: '0.92rem' }}>
        Book et ledigt vasketid i dit vaskerum.
      </p>

      {/* ── Task 3 — upcoming bookings card ────────────────────────────────────── */}
      {myBookings && myBookings.length > 0 && (
        <div className="rounded-3 mb-4" style={{ border: '1px solid #e8ecf0', backgroundColor: '#ffffff', overflow: 'hidden' }}>
          <div style={{ padding: '12px 20px', borderBottom: '1px solid #f0f4f8', backgroundColor: '#f8fafc' }}>
            <span style={{ fontWeight: 600, fontSize: '0.88rem', color: '#0d1b2a' }}>
              Mine kommende bookinger
            </span>
          </div>
          {myBookings.map(b => {
            const monthIdx = parseInt(b.date.split('-')[1] ?? '1', 10) - 1
            return (
              <div
                key={b.id}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 20px', borderBottom: '1px solid #f0f4f8', flexWrap: 'wrap', gap: 8,
                }}
              >
                <span style={{ fontSize: '0.88rem', color: '#0d1b2a' }}>
                  <strong style={{ color: '#1565c0', marginRight: 6 }}>
                    {dayShortLabel(b.date, today)} {dayNum(b.date)}. {MONTH_SHORT[monthIdx] ?? ''}
                  </strong>
                  {b.roomName} · {formatTimeRange(b.startTime, b.endTime)}
                </span>
                {b.canCancel ? (
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    style={{ fontSize: '0.75rem', padding: '2px 10px', borderRadius: 20 }}
                    onClick={() => handleCancelUpcoming(b)}
                  >
                    Aflys
                  </button>
                ) : (
                  <span style={{ fontSize: '0.75rem', color: '#a0adb8' }}>Aflysfrist udløbet</span>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ── Room selector ───────────────────────────────────────────────────────── */}
      {roomsLoading ? (
        <div className="mb-4">
          <div style={{ width: 120, height: 32, borderRadius: 20, backgroundColor: '#e8ecf0', display: 'inline-block' }} />
        </div>
      ) : rooms && rooms.length > 1 && (
        <div className="mb-4 d-flex gap-2 flex-wrap">
          {rooms.map(room => (
            <button
              key={room.id}
              className="btn btn-sm"
              style={{
                borderRadius: 20, padding: '5px 16px', fontSize: '0.85rem', fontWeight: 500,
                backgroundColor: selectedRoomId === room.id ? '#1565c0' : '#f0f4f8',
                color: selectedRoomId === room.id ? '#ffffff' : '#0d1b2a',
                border: 'none', transition: 'background-color 0.12s',
              }}
              onClick={() => setSelectedRoomId(room.id)}
            >
              {room.name}
            </button>
          ))}
        </div>
      )}

      {/* ── Booking grid card ────────────────────────────────────────────────────── */}
      <div className="rounded-3" style={{ border: '1px solid #e8ecf0', overflow: 'hidden', backgroundColor: '#ffffff' }}>

        {/* Week navigation */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: '1px solid #f0f4f8', backgroundColor: '#f8fafc' }}>
          <button
            className="btn btn-sm btn-outline-secondary"
            style={{ borderRadius: 20, padding: '2px 12px', fontSize: '0.8rem' }}
            onClick={() => shiftWeek(-1)}
            disabled={!canGoBack}
          >←</button>
          <span style={{ fontWeight: 600, fontSize: '0.88rem', color: '#0d1b2a' }}>
            {weekLabel(weekStart)}
            <span style={{ fontWeight: 400, color: '#8a9aaa', marginLeft: 8, fontSize: '0.82rem' }}>
              {weekFrom.slice(8).replace(/^0/, '')}. {MONTH_SHORT[parseInt(weekFrom.split('-')[1] ?? '1', 10) - 1] ?? ''}
              {' – '}
              {weekTo.slice(8).replace(/^0/, '')}. {MONTH_SHORT[parseInt(weekTo.split('-')[1] ?? '1', 10) - 1] ?? ''}
            </span>
          </span>
          <button
            className="btn btn-sm btn-outline-secondary"
            style={{ borderRadius: 20, padding: '2px 12px', fontSize: '0.8rem' }}
            onClick={() => shiftWeek(1)}
          >→</button>
        </div>

        {/* Task 1+2 — date strip with smart labels and availability dots */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid #f0f4f8' }}>
          {weekDays.map(d => {
            const shortLabel  = dayShortLabel(d, today)
            const num         = dayNum(d)
            const isToday     = d === today
            const isSelected  = d === selectedDate
            const dotState    = availabilityByDate[d] ?? 'free'

            return (
              <button
                key={d}
                onClick={() => setSelectedDate(d)}
                style={{
                  border: 'none', background: 'none', padding: '8px 4px',
                  cursor: 'pointer', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: 1,
                  borderBottom: isSelected ? '2px solid #1565c0' : '2px solid transparent',
                  backgroundColor: isSelected ? '#f0f5ff' : 'transparent',
                  transition: 'background-color 0.1s',
                }}
              >
                {/* Task 1 — smart day label */}
                <span style={{ fontSize: '0.65rem', fontWeight: 500, color: isToday ? '#1565c0' : '#8a9aaa', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                  {shortLabel}
                </span>
                {/* Day number */}
                <span style={{
                  fontSize: '0.9rem', fontWeight: 600,
                  color: isToday ? '#1565c0' : '#0d1b2a',
                  width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: '50%',
                  backgroundColor: isToday && !isSelected ? '#e8f0fe' : 'transparent',
                }}>
                  {num}
                </span>
                {/* Task 2 — availability dot */}
                <span style={{
                  width: 5, height: 5, borderRadius: '50%', display: 'block',
                  backgroundColor: isSelected ? 'rgba(21,101,192,0.25)' : (DOT_COLOR[dotState] ?? 'transparent'),
                }} />
              </button>
            )
          })}
        </div>

        {/* Selected date label */}
        <div style={{ padding: '8px 20px', borderBottom: '1px solid #f0f4f8', backgroundColor: '#fafbfc' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 500, color: '#5a6a7a' }}>
            {formatDateFull(selectedDate)}
            {selectedRoomId && rooms && rooms.length === 1 && (
              <span style={{ color: '#a0adb8', marginLeft: 8 }}>· {rooms.find(r => r.id === selectedRoomId)?.name}</span>
            )}
          </span>
        </div>

        {/* Grid */}
        {selectedRoomId ? (
          <BookingGrid
            slots={slots ?? []}
            date={selectedDate}
            today={today}
            bookingLookaheadDays={settings?.bookingLookaheadDays ?? 14}
            gridBookings={gridBookings}
            maxReached={maxReached}
            onBook={handleBook}
            onCancel={handleCancel}
            loading={gridLoading}
          />
        ) : (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#a0adb8', fontSize: '0.9rem' }}>
            Vælg et vaskerum herover.
          </div>
        )}

        {/* Task 9 — social context line */}
        {othersBookedToday > 0 && (
          <div style={{ padding: '8px 20px', borderTop: '1px solid #f0f4f8' }}>
            <p style={{ fontSize: '0.76rem', color: '#a0adb8', margin: 0, textAlign: 'center' }}>
              {othersBookedToday === 1
                ? '1 anden beboer har booket denne dag'
                : `${othersBookedToday} andre beboere har booket denne dag`}
            </p>
          </div>
        )}

        {/* Task 10 — milestone acknowledgment */}
        {milestoneCount !== null && (
          <div style={{ padding: '8px 20px', borderTop: '1px solid #f0f4f8' }}>
            <p style={{ fontSize: '0.76rem', color: '#5a6a7a', margin: 0, textAlign: 'center' }}>
              Du har nu booket {milestoneCount} gange — godt gået.
            </p>
          </div>
        )}
      </div>

      {/* ── Confirm modal ───────────────────────────────────────────────────────── */}
      {pending && (
        <ConfirmModal
          pending={pending}
          error={confirmError}
          loading={creating || cancelling}
          onConfirm={handleConfirm}
          onClose={() => { setPending(null); setConfirmError(null) }}
        />
      )}
    </div>
  )
}

// ── ConfirmModal ───────────────────────────────────────────────────────────────

function ConfirmModal({
  pending,
  error,
  loading,
  onConfirm,
  onClose,
}: {
  pending: PendingAction
  error: string | null
  loading: boolean
  onConfirm: () => void
  onClose: () => void
}) {
  const isBook   = pending.type === 'book'
  const dateText = formatDateFull(pending.date)

  // Task 8 — time-signal warning
  const showTimeWarning =
    !isBook &&
    pending.minutesUntil !== undefined &&
    pending.minutesUntil >= 0 &&
    pending.minutesUntil < 240

  return (
    <>
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.35)', zIndex: 1040, backdropFilter: 'blur(2px)' }}
      />
      <div
        style={{
          position: 'fixed', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1050, backgroundColor: '#ffffff', borderRadius: 12,
          boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
          width: 'min(92vw, 380px)', padding: '24px',
        }}
      >
        <h6 style={{ fontWeight: 700, marginBottom: 4, color: '#0d1b2a' }}>
          {isBook ? 'Bekræft booking' : 'Aflys booking'}
        </h6>

        <p style={{ color: '#5a6a7a', fontSize: '0.9rem', marginBottom: showTimeWarning ? 10 : 16 }}>
          {isBook
            ? <>Vil du booke <strong>{pending.slotTime}</strong> den <strong>{dateText}</strong>?</>
            : <>Vil du aflyse din booking kl. <strong>{pending.slotTime}</strong> den <strong>{dateText}</strong>?</>
          }
        </p>

        {/* Task 8 — time-signal warning */}
        {showTimeWarning && (
          <p style={{
            fontSize: '0.8rem', color: '#b45309',
            backgroundColor: '#fff8e1', border: '1px solid #ffe0b2',
            borderRadius: 6, padding: '6px 10px', marginBottom: 16,
          }}>
            {(pending.minutesUntil ?? 0) < 60
              ? `Der er kun ${pending.minutesUntil} minutter til din booking starter.`
              : `Der er ${Math.floor((pending.minutesUntil ?? 0) / 60)} time${Math.floor((pending.minutesUntil ?? 0) / 60) === 1 ? '' : 'r'} til din booking starter.`
            }
          </p>
        )}

        {error && (
          <div style={{ padding: '8px 12px', backgroundColor: '#fdecea', borderRadius: 6, color: '#b71c1c', fontSize: '0.83rem', marginBottom: 16 }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button
            className="btn btn-sm btn-outline-secondary"
            style={{ borderRadius: 20, padding: '5px 16px' }}
            onClick={onClose}
            disabled={loading}
          >
            Luk
          </button>
          <button
            className={`btn btn-sm ${isBook ? 'btn-primary' : 'btn-danger'}`}
            style={{ borderRadius: 20, padding: '5px 20px', minWidth: 80 }}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? <span className="spinner-border spinner-border-sm" /> : isBook ? 'Book' : 'Aflys'}
          </button>
        </div>
      </div>
    </>
  )
}
