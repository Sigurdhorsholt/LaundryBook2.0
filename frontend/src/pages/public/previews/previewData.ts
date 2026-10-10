import {
  BookingLabelKind, MachineType, type AdminBookingDto, type BookingDto, type MyBookingDto, type TimeSlotTemplateDto,
} from '../../../features/laundry/laundryApi'
import { BookingMode, BookingVisibility, type PropertyInfoDto } from '../../../features/properties/propertiesApi'
import type { TodayBooking } from '../../../features/properties/types'
import { addDays, getWeekMonday, todayStr } from '../../../shared/utils/dateUtils'

// Made-up data for the product previews on the public site. Dates follow the visitor's real week,
// so "I dag" and the passed times look right whenever the page is opened.

const TIMES = [
  ['07:00', '08:30'], ['08:30', '10:00'], ['10:00', '11:30'], ['11:30', '13:00'], ['13:00', '14:30'],
  ['14:30', '16:00'], ['16:00', '17:30'], ['17:30', '19:00'], ['19:00', '20:30'],
]
const FLATS = ['1A', '2C', '3B', '4A', '1C', '5B', '2A', '3C']

export const PREVIEW_PROPERTY = 'Mejlgade 42'
export const PREVIEW_ROOM = 'Vaskerum 1'

export const previewSlots: TimeSlotTemplateDto[] = TIMES.map(([start, end], i) => ({
  id: `s${i}`, startTime: `${start}:00`, endTime: `${end}:00`, isActive: true, upcomingBookingCount: 0,
}))

export function previewWeek() {
  const today = todayStr()
  const weekStart = getWeekMonday(today)
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const todayIndex = Math.max(0, weekDays.indexOf(today))
  const own = [
    { day: Math.min(todayIndex + 1, 6), slot: 6 },
    { day: Math.min(todayIndex + 3, 6), slot: 2 },
  ]

  const bookings: BookingDto[] = []
  weekDays.forEach((date, d) => previewSlots.forEach((slot, s) => {
    const mine = own.some(o => o.day === d && o.slot === s)
    // A fixed spread that reads as a realistic, fairly busy week
    const taken = !mine && (d * 3 + s * 5) % 7 < 3
    if (!mine && !taken) return
    bookings.push({
      id: `b${d}-${s}`, timeSlotTemplateId: slot.id, date, isOwn: mine,
      labelKind: mine ? BookingLabelKind.Own : BookingLabelKind.Apartment,
      labelValue: mine ? null : FLATS[(d + s) % FLATS.length]!,
      canCancel: mine, machineId: null, machineName: null,
    })
  }))

  const myBookings: MyBookingDto[] = bookings.filter(b => b.isOwn).map(b => {
    const slot = previewSlots.find(x => x.id === b.timeSlotTemplateId)!
    return {
      id: b.id, roomId: 'r1', roomName: PREVIEW_ROOM, timeSlotTemplateId: slot.id,
      startTime: slot.startTime, endTime: slot.endTime, date: b.date, canCancel: true, machineName: null,
    }
  }).sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime))

  // A free time a couple of days ahead, mid-week where possible, for the open booking popover
  let openSlot: { slotId: string; date: string; day: number } | null = null
  for (let d = Math.min(todayIndex + 1, 6); d < 7 && !openSlot; d++) {
    for (const s of [6, 5, 4, 3]) {
      const slot = previewSlots[s]!
      if (!bookings.some(b => b.date === weekDays[d] && b.timeSlotTemplateId === slot.id)) {
        openSlot = { slotId: slot.id, date: weekDays[d]!, day: d }
        break
      }
    }
  }

  return { today, weekStart, weekDays, bookings, myBookings, openSlot }
}

export function previewTodayBookings(today: string): TodayBooking[] {
  const rows: [string, string, string, string, TodayBooking['status']][] = [
    ['07:00', '08:30', 'Maja Holm', '3B', 'done'],
    ['10:00', '11:30', 'Jonas Berg', '1A', 'now'],
    ['16:00', '17:30', 'Sara Lund', '4A', 'later'],
    ['19:00', '20:30', 'Peter Nielsen', '2C', 'later'],
  ]
  return rows.map(([start, end, name, flat, status], i) => ({
    id: `t${i}`, roomId: 'r1', roomName: PREVIEW_ROOM, timeSlotTemplateId: `s${i}`, date: today,
    startTime: `${start}:00`, endTime: `${end}:00`, userId: `u${i}`, residentName: name, apartmentNumber: flat,
    machineName: null, status,
  }))
}

export const PREVIEW_ROOMS = [
  { id: 'r1', name: 'Vaskerum 1', booked: 26, utilization: 72 },
  { id: 'r2', name: 'Vaskerum 2', booked: 12, utilization: 41 },
]

export function previewAdminBookings(today: string): AdminBookingDto[] {
  const rows: [number, number, string, string][] = [
    [0, 0, 'Maja Holm', '3B'], [0, 2, 'Jonas Berg', '1A'], [0, 6, 'Sara Lund', '4A'], [0, 8, 'Peter Nielsen', '2C'],
    [1, 1, 'Emma Krogh', '5B'], [1, 4, 'Ali Hassan', '1C'], [1, 6, 'Maja Holm', '3B'],
    [2, 3, 'Lars Dahl', '2A'], [2, 7, 'Sofie Juul', '4C'],
  ]
  return rows.map(([offset, s, name, flat], i) => {
    const slot = previewSlots[s]!
    return {
      id: `a${i}`, roomId: 'r1', roomName: PREVIEW_ROOM, timeSlotTemplateId: slot.id, date: addDays(today, offset),
      startTime: slot.startTime, endTime: slot.endTime, userId: `u${i}`, residentName: name, apartmentNumber: flat, machineName: null,
    }
  })
}

export const PREVIEW_HOUSE_RULES = [
  '# Vaskeregler',
  '',
  'Vaskerummet er fælles. Hjælp med at holde det rart for alle.',
  '',
  '- Rens fnugfilteret i tørretumbleren efter brug.',
  '- Tøm maskinen senest **15 minutter** efter din tid.',
  '- Ingen vask efter kl. 21 af hensyn til naboerne.',
  '',
  '## Tørrerummet',
  '',
  'Tag dit tøj ned samme dag, og luk vinduet, når du går.',
].join('\n')

export const previewPropertyInfo: PropertyInfoDto = {
  id: 'preview', name: PREVIEW_PROPERTY, address: 'Mejlgade 42, 8000 Aarhus C',
  board: [{ name: 'Ole Hansen', email: 'ole.hansen@example.com' }],
  rooms: [{
    id: 'r1', name: PREVIEW_ROOM, description: 'Kælderen, opgang B',
    machines: [
      { name: 'Vaskemaskine 1', machineType: MachineType.Washer },
      { name: 'Vaskemaskine 2', machineType: MachineType.Washer },
      { name: 'Tørretumbler', machineType: MachineType.Dryer },
    ],
  }],
  settings: {
    bookingMode: BookingMode.BookEntireRoom, cancellationWindowMinutes: 60,
    maxConcurrentBookingsPerUser: 2, bookingLookaheadDays: 14, bookingVisibility: BookingVisibility.ApartmentOnly,
  },
  houseRules: PREVIEW_HOUSE_RULES, houseRulesUpdatedAt: null,
}
