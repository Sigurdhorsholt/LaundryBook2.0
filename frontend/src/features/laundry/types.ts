import type { BookingDto, LaundryMachineDto } from './laundryApi'

export type AvailabilityState = 'free' | 'few' | 'full' | 'past'

export type PendingAction = {
  type: 'book' | 'cancel'
  // 'grid' actions confirm inline in the row; 'week' and 'upcoming' actions use the modal
  source: 'grid' | 'week' | 'upcoming'
  slotId: string
  date: string
  slotTime: string
  bookingId?: string
  minutesUntil?: number
  machineId?: string
  machineName?: string
  // Machine mode in the week grid: the modal lets the resident pick one of these
  machineOptions?: { id: string; name: string }[]
}

/** A booking as seen from the active user's perspective, pre-computed by the parent. */
export interface GridBooking {
  bookingId: string
  slotId: string
  isOwn: boolean      // true = belongs to the current/viewing user
  label: string       // display text, already translated: "Min booking" | "Anna Hansen" | "Lejl. 2B" | "Optaget"
  canCancel: boolean  // only meaningful when isOwn=true
  machineId: string | null
  machineName: string | null
}

export type WeekCell =
  // freeMachines: in machine mode the resident can book more machines in a slot they're already in
  | { kind: 'own'; bookings: BookingDto[]; freeMachines: LaundryMachineDto[] }
  | { kind: 'taken'; label: string }
  | { kind: 'full' }
  | { kind: 'past' }
  | { kind: 'locked' }
  | { kind: 'free'; freeMachines: LaundryMachineDto[] }

export interface PendingSlot {
  id: string | null  // null = new, not yet persisted
  startTime: string  // "HH:mm:ss"
  endTime: string    // "HH:mm:ss"
  key: string        // stable React key
}

// ── Admin bookings overview ──────────────────────────────────────────────────

export type AdminBookingsView = 'list' | 'calendar'

/** A booking the admin has selected to cancel, with everything the confirm modal needs. */
export interface AdminCancelTarget {
  bookingId: string
  roomId: string
  roomName: string
  residentName: string
  dateLabel: string
  slotTime: string
}

// Booking rules from the property's settings, as shown to residents
export interface RoomRules {
  lookaheadDays: number
  maxBookings: number
  cancellationWindowMinutes: number
}

// Set when the property has house rules; isNew when this browser hasn't shown the latest version
export interface HouseRulesLink {
  isNew: boolean
}
