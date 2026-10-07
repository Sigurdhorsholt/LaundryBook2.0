import i18n from '../../i18n'
import { BookingLabelKind, type BookingDto, type LaundryMachineDto, type MyBookingDto, type TimeSlotTemplateDto } from './laundryApi'
import type { WeekCell } from './types'
import { CALENDAR_REMINDER_MINUTES, COPENHAGEN_VTIMEZONE } from './constants'
import { isLocked, isPast, minutesUntilSlot } from '../../shared/utils/dateUtils'

const BOOKING_COUNT_KEY = 'laundryBookingCount'

export function incrementBookingCount(): number {
  const next = parseInt(localStorage.getItem(BOOKING_COUNT_KEY) ?? '0', 10) + 1
  localStorage.setItem(BOOKING_COUNT_KEY, String(next))
  return next
}

// Formatted here rather than on the server so the text follows the resident's chosen language
export function bookingLabel(b: Pick<BookingDto, 'labelKind' | 'labelValue'>): string {
  switch (b.labelKind) {
    case BookingLabelKind.Own: return i18n.t('laundry.slot.myBooking')
    case BookingLabelKind.Name: return b.labelValue ?? i18n.t('laundry.slot.taken')
    case BookingLabelKind.Apartment: return i18n.t('laundry.apartmentShort', { number: b.labelValue ?? '' })
    default: return i18n.t('laundry.slot.taken')
  }
}

export interface WeekCellContext {
  today: string
  lookaheadDays: number
  machineMode: boolean
  machines: LaundryMachineDto[]
  bookings: BookingDto[]
}

export function weekCell(slot: TimeSlotTemplateDto, date: string, ctx: WeekCellContext): WeekCell {
  const here = ctx.bookings.filter(b => b.date === date && b.timeSlotTemplateId === slot.id)
  const past = isPast(date, slot.startTime, ctx.today)
  // Machines nobody has booked in this slot; only machine mode has more than one bookable unit
  const freeMachines = ctx.machineMode && !past
    ? ctx.machines.filter(m => !here.some(b => b.machineId === m.id))
    : []
  const own = here.filter(b => b.isOwn)
  if (own.length > 0) return { kind: 'own', bookings: own, freeMachines }
  if (past) return { kind: 'past' }
  if (isLocked(date, ctx.today, ctx.lookaheadDays)) return { kind: 'locked' }
  if (!ctx.machineMode) {
    const taken = here[0]
    return taken ? { kind: 'taken', label: bookingLabel(taken) } : { kind: 'free', freeMachines: [] }
  }
  return freeMachines.length > 0 ? { kind: 'free', freeMachines } : { kind: 'full' }
}

export function freeSlotCount(slots: TimeSlotTemplateDto[], date: string, ctx: WeekCellContext): number {
  return slots.filter(s => {
    const cell = weekCell(s, date, ctx)
    return cell.kind === 'free' || (cell.kind === 'own' && cell.freeMachines.length > 0)
  }).length
}

export function nextBooking(myBookings: MyBookingDto[]): MyBookingDto | null {
  const upcoming = myBookings
    .filter(b => minutesUntilSlot(b.date, b.endTime) > 0)
    .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime))
  return upcoming[0] ?? null
}

function icsText(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n')
}

// RFC 5545 caps a line at 75 octets; the rest continues on lines that start with a space
function icsFold(line: string): string {
  const encoder = new TextEncoder()
  const parts: string[] = []
  let current = ''
  let bytes = 0
  for (const ch of line) {
    const size = encoder.encode(ch).length
    if (bytes + size > (parts.length === 0 ? 75 : 74)) {
      parts.push(current)
      current = ''
      bytes = 0
    }
    current += ch
    bytes += size
  }
  parts.push(current)
  return parts.join('\r\n ')
}

// "2026-10-08" + "16:00:00" → "20261008T160000"
function icsLocalTime(date: string, time: string): string {
  return `${date.replace(/-/g, '')}T${time.replace(/:/g, '').padEnd(6, '0').slice(0, 6)}`
}

export function bookingCalendarFile(b: MyBookingDto, propertyName: string | null, now = new Date()): string {
  const summary = i18n.t('laundry.calendarFile.summary', { where: [b.roomName, b.machineName].filter(Boolean).join(' · ') })
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//LaundryBook//Vasketider//DA',
    'CALSCALE:GREGORIAN',
    ...COPENHAGEN_VTIMEZONE,
    'BEGIN:VEVENT',
    // Stable per booking, so downloading it again updates the event instead of adding a second one
    `UID:${b.id}@laundrybook`,
    `DTSTAMP:${now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}`,
    `DTSTART;TZID=Europe/Copenhagen:${icsLocalTime(b.date, b.startTime)}`,
    `DTEND;TZID=Europe/Copenhagen:${icsLocalTime(b.date, b.endTime)}`,
    `SUMMARY:${icsText(summary)}`,
    `LOCATION:${icsText([propertyName, b.roomName].filter(Boolean).join(', '))}`,
    `DESCRIPTION:${icsText(i18n.t('laundry.calendarFile.description'))}`,
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:${icsText(summary)}`,
    `TRIGGER:-PT${CALENDAR_REMINDER_MINUTES}M`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ]
  return lines.map(icsFold).join('\r\n') + '\r\n'
}
