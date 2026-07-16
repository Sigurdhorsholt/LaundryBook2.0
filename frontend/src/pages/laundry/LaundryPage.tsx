import { useState, useMemo, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { skipToken } from '@reduxjs/toolkit/query/react'
import { useMeQuery } from '../../features/auth/authApi'
import { useGetPropertyQuery, BookingMode } from '../../features/properties/propertiesApi'
import {
  useGetLaundryRoomsQuery,
  useGetMachinesQuery,
  useGetTimeSlotsQuery,
  useGetBookingsQuery,
  useGetMyBookingsQuery,
  useCreateBookingMutation,
  useCancelBookingMutation,
} from '../../features/laundry/laundryApi'
import type { MyBookingDto } from '../../features/laundry/laundryApi'
import type { PendingAction, GridBooking, AvailabilityState } from '../../features/laundry/types'
import { BookingGrid } from '../../features/laundry/BookingGrid'
import { UpcomingBookingsCard } from '../../features/laundry/UpcomingBookingsCard'
import { RoomSelector } from '../../features/laundry/RoomSelector'
import { WeekNavigator } from '../../features/laundry/WeekNavigator'
import { DateStrip } from '../../features/laundry/DateStrip'
import { ConfirmBookingModal } from '../../features/laundry/ConfirmBookingModal'
import { PageHeader } from '../../shared/ui'
import {
  todayStr, addDays, getWeekMonday, formatTimeRange, formatDateFull,
  minutesUntilSlot,
} from '../../shared/utils/dateUtils'
import { colors } from '../../shared/theme'

// ── localStorage helpers for booking count milestone ──────────────────────────

function getBookingCount(): number {
  return parseInt(localStorage.getItem('laundryBookingCount') ?? '0', 10)
}
function incrementBookingCount(): number {
  const next = getBookingCount() + 1
  localStorage.setItem('laundryBookingCount', String(next))
  return next
}

function extractErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === 'object' && 'data' in err) {
    const data = (err as { data?: { title?: string } }).data
    if (data?.title) return data.title
  }
  return fallback
}

// ── Component ──────────────────────────────────────────────────────────────────

export function LaundryPage() {
  const { t } = useTranslation()
  const today = todayStr()
  const [weekStart, setWeekStart]           = useState(() => getWeekMonday(today))
  const [selectedDate, setSelectedDate]     = useState(today)
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null)
  const [pending, setPending]               = useState<PendingAction | null>(null)
  const [confirmError, setConfirmError]     = useState<string | null>(null)
  const [milestoneCount, setMilestoneCount] = useState<number | null>(null)
  const [bookingsExpanded, setBookingsExpanded] = useState(true)
  const gridRef    = useRef<HTMLDivElement>(null)
  const [gridVisible, setGridVisible] = useState(false)

  useEffect(() => {
    const el = gridRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => setGridVisible((entry?.intersectionRatio ?? 0) >= 0.7),
      { threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7] },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const { data: me } = useMeQuery()
  const propertyId   = me?.memberships[0]?.propertyId ?? null

  const { data: property } = useGetPropertyQuery(propertyId ?? skipToken)
  const settings = property?.settings
  const bookingMode = settings?.bookingMode
  const machineMode = bookingMode === BookingMode.BookSpecificMachine

  const { data: rooms, isLoading: roomsLoading } = useGetLaundryRoomsQuery(propertyId ?? skipToken)

  useEffect(() => {
    if (rooms && rooms.length > 0 && selectedRoomId === null) {
      setSelectedRoomId(rooms[0]?.id ?? null)
    }
  }, [rooms, selectedRoomId])

  // Disarm an inline grid confirm when the user navigates to another day or room
  useEffect(() => {
    setPending(p => (p?.source === 'grid' ? null : p))
    setConfirmError(null)
  }, [selectedDate, selectedRoomId])

  const weekFrom = weekStart
  const weekTo   = addDays(weekStart, 6)

  const { data: slots, isLoading: slotsLoading }     = useGetTimeSlotsQuery(selectedRoomId ?? skipToken)
  const { data: machines } = useGetMachinesQuery(machineMode && selectedRoomId ? selectedRoomId : skipToken)
  const { data: bookings, isLoading: bookingsLoading } = useGetBookingsQuery(
    selectedRoomId ? { roomId: selectedRoomId, from: weekFrom, to: weekTo } : skipToken
  )
  const { data: myBookings } = useGetMyBookingsQuery(propertyId ?? skipToken)

  const [createBooking, { isLoading: creating }]  = useCreateBookingMutation()
  const [cancelBooking, { isLoading: cancelling }] = useCancelBookingMutation()

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  )

  const gridBookings = useMemo((): GridBooking[] =>
    (bookings ?? [])
      .filter(b => b.date === selectedDate)
      .map(b => ({
        bookingId: b.id,
        slotId: b.timeSlotTemplateId,
        isOwn: b.isOwn,
        label: b.label,
        canCancel: b.canCancel,
        machineId: b.machineId,
        machineName: b.machineName,
      }))
  , [bookings, selectedDate])

  const maxReached =
    (myBookings?.filter(b => b.date >= today).length ?? 0) >=
    (settings?.maxConcurrentBookingsPerUser ?? 2)

  const availabilityByDate = useMemo((): Record<string, AvailabilityState> => {
    const result: Record<string, AvailabilityState> = {}
    const lookaheadEnd = settings ? addDays(today, settings.bookingLookaheadDays) : null
    const totalSlots   = (slots ?? []).length
    const capacityPerSlot = machineMode ? (machines?.length ?? 0) : 1
    const totalCapacity   = totalSlots * capacityPerSlot
    for (const d of weekDays) {
      if (d < today || (lookaheadEnd !== null && d > lookaheadEnd)) {
        result[d] = 'past'
        continue
      }
      const bookedCount = (bookings ?? []).filter(b => b.date === d).length
      const free        = totalCapacity - bookedCount
      result[d] = free <= 0 ? 'full' : free <= 2 ? 'few' : 'free'
    }
    return result
  }, [weekDays, bookings, slots, today, settings, machineMode, machines])

  const othersBookedToday = useMemo(
    () => (bookings ?? []).filter(b => b.date === selectedDate && !b.isOwn).length
  , [bookings, selectedDate])

  const todayWeekMonday = getWeekMonday(today)
  const canGoBack       = weekStart > todayWeekMonday

  function shiftWeek(delta: number) {
    const newStart = addDays(weekStart, delta * 7)
    setWeekStart(newStart)
    const newEnd = addDays(newStart, 6)
    if (selectedDate < newStart || selectedDate > newEnd) {
      setSelectedDate(delta > 0 ? newStart : newEnd)
    }
  }

  // ── Booking handlers ───────────────────────────────────────────────────────

  function handleBook(slotId: string, machineId?: string) {
    const slot = slots?.find(s => s.id === slotId)
    if (!slot) return
    const machineName = machineId ? machines?.find(m => m.id === machineId)?.name : undefined
    setPending({
      type: 'book', source: 'grid', slotId, date: selectedDate,
      slotTime: formatTimeRange(slot.startTime, slot.endTime),
      machineId, machineName,
    })
    setConfirmError(null)
  }

  function handleCancel(slotId: string, machineId?: string) {
    const slot = slots?.find(s => s.id === slotId)
    const b = (bookings ?? []).find(x =>
      x.timeSlotTemplateId === slotId &&
      x.date === selectedDate &&
      x.isOwn &&
      (machineId ? x.machineId === machineId : true))
    if (!slot || !b) return
    setPending({
      type: 'cancel', source: 'grid', slotId, date: selectedDate,
      slotTime: formatTimeRange(slot.startTime, slot.endTime),
      bookingId: b.id,
      minutesUntil: minutesUntilSlot(selectedDate, slot.startTime),
      machineId: machineId ?? b.machineId ?? undefined,
      machineName: b.machineName ?? undefined,
    })
    setConfirmError(null)
  }

  function handleCancelUpcoming(b: MyBookingDto) {
    setPending({
      type: 'cancel', source: 'upcoming', slotId: b.timeSlotTemplateId, date: b.date,
      slotTime: formatTimeRange(b.startTime, b.endTime),
      bookingId: b.id,
      minutesUntil: minutesUntilSlot(b.date, b.startTime),
    })
    setConfirmError(null)
  }

  function dismissConfirm() {
    setPending(null)
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
          machineId: pending.machineId ?? null,
        }).unwrap()
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
      setConfirmError(extractErrorMessage(err, t('laundryPage.genericError')))
    }
  }

  // ── No property guard ──────────────────────────────────────────────────────

  if (!propertyId) {
    return (
      <div className="container-xl px-4 py-5">
        <PageHeader title={t('nav.laundry')} description={t('laundryPage.notLinkedDescription')} />
      </div>
    )
  }

  const gridLoading = slotsLoading || bookingsLoading || !settings

  return (
    <div className="container-xl px-4 py-5">

      <PageHeader title={t('nav.laundry')} description={t('laundryPage.description')} />

      <UpcomingBookingsCard
        myBookings={myBookings ?? []}
        today={today}
        expanded={bookingsExpanded}
        onToggle={() => setBookingsExpanded(x => !x)}
        onCancelUpcoming={handleCancelUpcoming}
      />

      {roomsLoading ? (
        <div className="mb-4">
          <div style={{ width: 120, height: 32, borderRadius: 20, backgroundColor: colors.borderDefault, display: 'inline-block' }} />
        </div>
      ) : (
        <RoomSelector
          rooms={rooms ?? []}
          selectedRoomId={selectedRoomId}
          onSelect={setSelectedRoomId}
        />
      )}

      <div ref={gridRef} className="rounded-3" style={{ border: `1px solid ${colors.borderDefault}`, overflow: 'hidden', backgroundColor: colors.bgCard }}>

        <WeekNavigator
          weekStart={weekStart}
          weekFrom={weekFrom}
          weekTo={weekTo}
          canGoBack={canGoBack}
          onShift={shiftWeek}
        />

        <DateStrip
          weekDays={weekDays}
          today={today}
          selectedDate={selectedDate}
          availabilityByDate={availabilityByDate}
          onSelectDate={setSelectedDate}
        />

        <div style={{ padding: '8px 20px', borderBottom: `1px solid ${colors.borderRow}`, backgroundColor: colors.bgPage }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 500, color: colors.textSecondary }}>
            {formatDateFull(selectedDate)}
            {selectedRoomId && rooms && rooms.length === 1 && (
              <span style={{ color: colors.textMuted, marginLeft: 8 }}>· {rooms.find(r => r.id === selectedRoomId)?.name}</span>
            )}
          </span>
        </div>

        {selectedRoomId ? (
          <BookingGrid
            slots={slots ?? []}
            date={selectedDate}
            today={today}
            bookingLookaheadDays={settings?.bookingLookaheadDays ?? 14}
            gridBookings={gridBookings}
            maxReached={maxReached}
            bookingMode={bookingMode ?? BookingMode.BookEntireRoom}
            machines={machines ?? []}
            onBook={handleBook}
            onCancel={handleCancel}
            loading={gridLoading}
            pending={pending?.source === 'grid' ? pending : null}
            confirmLoading={creating || cancelling}
            confirmError={confirmError}
            onConfirm={handleConfirm}
            onDismissConfirm={dismissConfirm}
          />
        ) : (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: colors.textMuted, fontSize: '0.9rem' }}>
            {t('laundryPage.selectRoom')}
          </div>
        )}

        {othersBookedToday > 0 && (
          <div style={{ padding: '8px 20px', borderTop: `1px solid ${colors.borderRow}` }}>
            <p style={{ fontSize: '0.76rem', color: colors.textMuted, margin: 0, textAlign: 'center' }}>
              {t('laundryPage.othersBooked', { count: othersBookedToday })}
            </p>
          </div>
        )}

        {milestoneCount !== null && (
          <div style={{ padding: '8px 20px', borderTop: `1px solid ${colors.borderRow}` }}>
            <p style={{ fontSize: '0.76rem', color: colors.textSecondary, margin: 0, textAlign: 'center' }}>
              {t('laundryPage.milestone', { count: milestoneCount })}
            </p>
          </div>
        )}
      </div>

      {myBookings && myBookings.length > 0 && !gridVisible && (
        <button
          aria-label={t('laundryPage.goToBooking')}
          onClick={() => gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          style={{
            position: 'fixed', bottom: 24, right: 20, zIndex: 900,
            width: 38, height: 38, borderRadius: '50%',
            border: `1px solid ${colors.primaryBorder}`,
            backgroundColor: 'rgba(255,255,255,0.92)', color: colors.primary,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 10px rgba(0,0,0,0.10)', cursor: 'pointer', backdropFilter: 'blur(4px)',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 5l5 5 5-5" stroke={colors.primary} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}

      {pending?.source === 'upcoming' && (
        <ConfirmBookingModal
          pending={pending}
          error={confirmError}
          loading={creating || cancelling}
          onConfirm={handleConfirm}
          onClose={dismissConfirm}
        />
      )}
    </div>
  )
}
