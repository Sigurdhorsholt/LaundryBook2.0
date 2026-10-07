import i18n from '../../i18n'
import { BookingLabelKind, type BookingDto, type LaundryMachineDto, type MyBookingDto, type TimeSlotTemplateDto } from './laundryApi'
import type { WeekCell } from './types'
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
  const own = here.find(b => b.isOwn)
  if (own) return { kind: 'own', booking: own }
  if (isPast(date, slot.startTime, ctx.today)) return { kind: 'past' }
  if (isLocked(date, ctx.today, ctx.lookaheadDays)) return { kind: 'locked' }
  if (!ctx.machineMode) {
    const taken = here[0]
    return taken ? { kind: 'taken', label: bookingLabel(taken) } : { kind: 'free', freeMachines: [] }
  }
  const freeMachines = ctx.machines.filter(m => !here.some(b => b.machineId === m.id))
  return freeMachines.length > 0 ? { kind: 'free', freeMachines } : { kind: 'full' }
}

export function freeSlotCount(slots: TimeSlotTemplateDto[], date: string, ctx: WeekCellContext): number {
  return slots.filter(s => weekCell(s, date, ctx).kind === 'free').length
}

export function nextBooking(myBookings: MyBookingDto[]): MyBookingDto | null {
  const upcoming = myBookings
    .filter(b => minutesUntilSlot(b.date, b.endTime) > 0)
    .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime))
  return upcoming[0] ?? null
}
