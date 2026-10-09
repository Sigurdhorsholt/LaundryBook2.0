import { useState, useMemo, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { skipToken } from '@reduxjs/toolkit/query/react'
import { useActiveProperty } from '../properties/useActiveProperty'
import { useGetPropertyQuery, useGetPropertyInfoQuery, BookingMode } from '../properties/propertiesApi'
import { houseRulesUnseen } from '../properties/utils'
import {
  useGetLaundryRoomsQuery,
  useGetMachinesQuery,
  useGetTimeSlotsQuery,
  useGetBookingsQuery,
  useGetMyBookingsQuery,
  useCreateBookingMutation,
  useCancelBookingMutation,
} from './laundryApi'
import type { BookingDto, MyBookingDto } from './laundryApi'
import type { PendingAction, BookingAction, OpenWeekSlot, GridBooking, AvailabilityState } from './types'
import { incrementBookingCount, freeSlotCount, bookingLabel, type WeekCellContext } from './utils'
import { extractErrorMessage } from '../../shared/utils/errorUtils'
import { todayStr, addDays, getWeekMonday, formatTimeRange, minutesUntilSlot } from '../../shared/utils/dateUtils'

export function useLaundryBooking() {
  const { t } = useTranslation()
  const [today, setToday]                   = useState(todayStr)
  const todayRef                            = useRef(today)
  const [weekStart, setWeekStart]           = useState(() => getWeekMonday(today))
  const [selectedDate, setSelectedDate]     = useState(today)
  const [pickedRoomId, setPickedRoomId]     = useState<string | null>(null)
  const [pending, setPending]               = useState<PendingAction | null>(null)
  const [weekSlot, setWeekSlot]             = useState<OpenWeekSlot | null>(null)
  const [confirmError, setConfirmError]     = useState<string | null>(null)
  const [milestoneCount, setMilestoneCount] = useState<number | null>(null)

  // A phone tab left open overnight would otherwise keep showing (and booking against) yesterday
  useEffect(() => {
    function syncToday() {
      if (document.visibilityState !== 'visible') return
      const now = todayStr()
      if (now === todayRef.current) return
      todayRef.current = now
      setToday(now)
      setSelectedDate((d) => (d < now ? now : d))
      setWeekStart((w) => (w < getWeekMonday(now) ? getWeekMonday(now) : w))
    }
    document.addEventListener('visibilitychange', syncToday)
    window.addEventListener('focus', syncToday)
    return () => {
      document.removeEventListener('visibilitychange', syncToday)
      window.removeEventListener('focus', syncToday)
    }
  }, [])

  const { membership } = useActiveProperty()
  const propertyId   = membership?.propertyId ?? null
  // Switching property leaves the room, an open confirm or popover pointing at the old one
  const [prevPropertyId, setPrevPropertyId] = useState(propertyId)
  if (prevPropertyId !== propertyId) {
    setPrevPropertyId(propertyId)
    setPickedRoomId(null)
    setPending(null)
    setWeekSlot(null)
    setConfirmError(null)
  }

  const property = useGetPropertyQuery(propertyId ?? skipToken)
  // Only to know whether to point at the house rules; the property page shares this cached request
  const { data: info } = useGetPropertyInfoQuery(propertyId ?? skipToken)
  const houseRules = propertyId && info?.houseRules && info.houseRulesUpdatedAt
    ? { isNew: houseRulesUnseen(propertyId, info.houseRulesUpdatedAt) }
    : null
  const settings = property.data?.settings
  const bookingMode = settings?.bookingMode ?? BookingMode.BookEntireRoom
  const machineMode = bookingMode === BookingMode.BookSpecificMachine
  const lookaheadDays = settings?.bookingLookaheadDays ?? 14
  const maxBookings = settings?.maxConcurrentBookingsPerUser ?? 2

  const rooms = useGetLaundryRoomsQuery(propertyId ?? skipToken)
  // Until the resident picks a room, the first one is shown
  const selectedRoomId = pickedRoomId ?? rooms.data?.[0]?.id ?? null

  const weekFrom = weekStart
  const weekTo   = addDays(weekStart, 6)

  const slotsQuery = useGetTimeSlotsQuery(selectedRoomId ?? skipToken)
  const { data: machines } = useGetMachinesQuery(selectedRoomId ?? skipToken)
  const bookingsQuery = useGetBookingsQuery(
    selectedRoomId ? { roomId: selectedRoomId, from: weekFrom, to: weekTo } : skipToken,
    { refetchOnFocus: true, refetchOnReconnect: true },
  )
  const { data: myBookings } = useGetMyBookingsQuery(
    propertyId ?? skipToken,
    { refetchOnFocus: true, refetchOnReconnect: true },
  )
  const slots    = slotsQuery.data
  const bookings = bookingsQuery.data

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
        label: bookingLabel(b),
        canCancel: b.canCancel,
        machineId: b.machineId,
        machineName: b.machineName,
      }))
  , [bookings, selectedDate])

  // Today's finished bookings still count: the limit is per day, not per remaining time
  const usedBookings = myBookings?.filter(b => b.date >= today).length ?? 0
  const maxReached = usedBookings >= maxBookings

  const cellContext = useMemo((): WeekCellContext => ({
    today, lookaheadDays, machineMode, machines: machines ?? [], bookings: bookings ?? [],
  }), [today, lookaheadDays, machineMode, machines, bookings])

  const freeCountByDate = useMemo((): Record<string, number> =>
    Object.fromEntries(weekDays.map(d => [d, freeSlotCount(slots ?? [], d, cellContext)]))
  , [weekDays, slots, cellContext])

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
  // Weeks entirely beyond the booking window would only show "not available" slots
  const canGoForward    = !settings || addDays(weekStart, 7) <= addDays(today, settings.bookingLookaheadDays)

  // An armed inline confirm or an open week popover belongs to one slot; leaving the day, week or room closes it
  function disarmGridConfirm() {
    setPending(p => (p?.source === 'grid' ? null : p))
    setWeekSlot(null)
    setConfirmError(null)
  }

  function selectDate(date: string) {
    setSelectedDate(date)
    disarmGridConfirm()
  }

  function selectRoom(roomId: string) {
    setPickedRoomId(roomId)
    disarmGridConfirm()
  }

  function shiftWeek(delta: number) {
    disarmGridConfirm()
    const newStart = addDays(weekStart, delta * 7)
    setWeekStart(newStart)
    const newEnd = addDays(newStart, 6)
    if (selectedDate < newStart || selectedDate > newEnd) {
      setSelectedDate(delta > 0 ? newStart : newEnd)
    }
  }

  function arm(action: PendingAction) {
    setPending(action)
    setConfirmError(null)
  }

  function handleBook(slotId: string, machineId?: string) {
    const slot = slots?.find(s => s.id === slotId)
    if (!slot) return
    const machineName = machineId ? machines?.find(m => m.id === machineId)?.name : undefined
    arm({
      type: 'book', source: 'grid', slotId, date: selectedDate,
      slotTime: formatTimeRange(slot.startTime, slot.endTime),
      machineId, machineName,
    })
  }

  function handleCancel(slotId: string, machineId?: string) {
    const slot = slots?.find(s => s.id === slotId)
    const b = (bookings ?? []).find(x =>
      x.timeSlotTemplateId === slotId &&
      x.date === selectedDate &&
      x.isOwn &&
      (machineId ? x.machineId === machineId : true))
    if (!slot || !b) return
    arm({
      type: 'cancel', source: 'grid', slotId, date: selectedDate,
      slotTime: formatTimeRange(slot.startTime, slot.endTime),
      bookingId: b.id,
      minutesUntil: minutesUntilSlot(selectedDate, slot.startTime),
      machineId: machineId ?? b.machineId ?? undefined,
      machineName: b.machineName ?? undefined,
    })
  }

  function openWeekSlot(slotId: string, date: string) {
    setWeekSlot({ slotId, date })
    setConfirmError(null)
  }

  function closeWeekSlot() {
    setWeekSlot(null)
    setConfirmError(null)
  }

  // The popover is the confirm step itself, so its buttons act straight away
  async function bookWeekSlot(machineId?: string) {
    if (weekSlot && await perform({ type: 'book', ...weekSlot, machineId })) setWeekSlot(null)
  }

  async function cancelWeekBooking(booking: BookingDto) {
    const action: BookingAction = { type: 'cancel', slotId: booking.timeSlotTemplateId, date: booking.date, bookingId: booking.id }
    if (await perform(action)) setWeekSlot(null)
  }

  function handleCancelUpcoming(b: MyBookingDto) {
    arm({
      type: 'cancel', source: 'upcoming', slotId: b.timeSlotTemplateId, date: b.date,
      slotTime: formatTimeRange(b.startTime, b.endTime),
      bookingId: b.id,
      minutesUntil: minutesUntilSlot(b.date, b.startTime),
      machineName: b.machineName ?? undefined,
    })
  }

  function dismissConfirm() {
    setPending(null)
    setConfirmError(null)
  }

  async function perform(action: BookingAction): Promise<boolean> {
    if (!propertyId) return false
    try {
      if (action.type === 'book') {
        if (!selectedRoomId) return false
        await createBooking({
          roomId: selectedRoomId, propertyId,
          timeSlotTemplateId: action.slotId, date: action.date,
          machineId: action.machineId ?? null,
        }).unwrap()
        const newCount = incrementBookingCount()
        if (newCount % 5 === 0) {
          setMilestoneCount(newCount)
          setTimeout(() => setMilestoneCount(null), 4000)
        }
      } else {
        if (!action.bookingId) return false
        // Prefer the booking's own room: cancelling from the upcoming card can target another room
        const roomId = myBookings?.find(m => m.id === action.bookingId)?.roomId ?? selectedRoomId
        if (!roomId) return false
        await cancelBooking({ bookingId: action.bookingId, roomId, propertyId }).unwrap()
      }
      return true
    } catch (err) {
      setConfirmError(extractErrorMessage(err, t('laundryPage.genericError')))
      return false
    }
  }

  async function handleConfirm() {
    if (pending && await perform(pending)) setPending(null)
  }

  return {
    propertyId,
    settings,
    bookingMode,
    machineMode,
    lookaheadDays,
    maxBookings,
    usedBookings,
    houseRules,
    roomRules: settings
      ? { lookaheadDays, maxBookings, cancellationWindowMinutes: settings.cancellationWindowMinutes }
      : null,
    maxReached,
    property,
    rooms,
    selectedRoomId,
    selectedRoom: rooms.data?.find(r => r.id === selectedRoomId) ?? null,
    selectRoom,
    today,
    weekStart,
    weekFrom,
    weekTo,
    weekDays,
    canGoBack,
    canGoForward,
    shiftWeek,
    selectedDate,
    selectDate,
    slotsQuery,
    bookingsQuery,
    slots: slots ?? [],
    machines: machines ?? [],
    myBookings: myBookings ?? [],
    gridBookings,
    cellContext,
    freeCountByDate,
    availabilityByDate,
    othersBookedToday,
    gridLoading: slotsQuery.isLoading || bookingsQuery.isLoading || !settings,
    pending,
    confirmError,
    confirmLoading: creating || cancelling,
    milestoneCount,
    handleBook,
    handleCancel,
    weekSlot,
    openWeekSlot,
    closeWeekSlot,
    bookWeekSlot,
    cancelWeekBooking,
    handleCancelUpcoming,
    dismissConfirm,
    handleConfirm,
  }
}

export type LaundryBooking = ReturnType<typeof useLaundryBooking>
