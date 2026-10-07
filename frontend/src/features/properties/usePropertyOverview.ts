import { useMemo, useState } from 'react'
import { skipToken } from '@reduxjs/toolkit/query/react'
import { useGetPropertyBookingsQuery, type AdminBookingDto } from '../laundry/laundryApi'
import { useGetPropertyMembersQuery, useGetPendingInvitesQuery } from '../users/usersApi'
import { addDays, getWeekMonday, minutesUntilSlot, todayStr } from '../../shared/utils/dateUtils'
import type { OverviewAttentionItem, TodayBooking } from './types'

export function usePropertyOverview(propertyId: string | undefined) {
  const [today] = useState(todayStr)
  const weekStart = getWeekMonday(today)
  const lastWeekStart = addDays(weekStart, -7)
  const weekEnd = addDays(weekStart, 6)

  // One request covers last week too, so the week-on-week change needs no second call
  const bookingsQuery = useGetPropertyBookingsQuery(
    propertyId ? { propertyId, from: lastWeekStart, to: weekEnd } : skipToken,
    { refetchOnFocus: true },
  )
  const membersQuery = useGetPropertyMembersQuery(propertyId ?? skipToken)
  const pendingQuery = useGetPendingInvitesQuery(propertyId ?? skipToken)

  const derived = useMemo(() => {
    const all = bookingsQuery.data?.bookings ?? []
    const rooms = (bookingsQuery.data?.rooms ?? []).filter(r => r.isActive)
    const thisWeek = all.filter(b => b.date >= weekStart)
    const lastWeekCount = all.length - thisWeek.length

    const capacity = rooms.reduce((sum, r) => sum + r.activeSlotCount * r.capacityPerSlot * 7, 0)
    const utilization = capacity > 0 ? Math.round((thisWeek.length / capacity) * 100) : 0

    const perDay = new Map<string, number>()
    for (const b of thisWeek) perDay.set(b.date, (perDay.get(b.date) ?? 0) + 1)
    const busiestDay = [...perDay.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null

    const perRoom = rooms.map(r => {
      const booked = thisWeek.filter(b => b.roomId === r.id).length
      const roomCapacity = r.activeSlotCount * r.capacityPerSlot * 7
      return { id: r.id, name: r.name, booked, utilization: roomCapacity > 0 ? Math.round((booked / roomCapacity) * 100) : 0 }
    })

    const todayBookings: TodayBooking[] = all
      .filter(b => b.date === today)
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
      .map(b => ({ ...b, status: statusOf(b) }))

    const attention: OverviewAttentionItem[] = []
    const pending = pendingQuery.data?.length ?? 0
    if (pending > 0) attention.push({ kind: 'pendingInvites', count: pending })
    for (const r of rooms) {
      if (r.activeSlotCount === 0) attention.push({ kind: 'noSlots', roomName: r.name })
      // Machine mode reports capacity 0 for a room without active machines
      else if (r.capacityPerSlot === 0) attention.push({ kind: 'noMachines', roomName: r.name })
    }

    return {
      weekCount: thisWeek.length,
      weekDelta: thisWeek.length - lastWeekCount,
      utilization,
      busiestDay,
      perRoom,
      todayBookings,
      laterToday: todayBookings.filter(b => b.status === 'later').length,
      attention,
    }
  }, [bookingsQuery.data, pendingQuery.data, today, weekStart])

  return {
    today,
    weekStart,
    ...derived,
    residents: membersQuery.data?.filter(m => m.isActive).length ?? 0,
    pendingInvites: pendingQuery.data?.length ?? 0,
    isLoading: bookingsQuery.isLoading || membersQuery.isLoading || pendingQuery.isLoading,
    isError: bookingsQuery.isError || membersQuery.isError || pendingQuery.isError,
    refetch: () => {
      bookingsQuery.refetch()
      membersQuery.refetch()
      pendingQuery.refetch()
    },
  }
}

function statusOf(b: AdminBookingDto): TodayBooking['status'] {
  if (minutesUntilSlot(b.date, b.endTime) <= 0) return 'done'
  return minutesUntilSlot(b.date, b.startTime) <= 0 ? 'now' : 'later'
}
