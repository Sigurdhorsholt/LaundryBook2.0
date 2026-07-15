export type AvailabilityState = 'free' | 'few' | 'full' | 'past'

export type PendingAction = {
  type: 'book' | 'cancel'
  slotId: string
  date: string
  slotTime: string
  bookingId?: string
  minutesUntil?: number
  machineId?: string
  machineName?: string
}

/** A booking as seen from the active user's perspective, pre-computed by the parent. */
export interface GridBooking {
  bookingId: string
  slotId: string
  isOwn: boolean      // true = belongs to the current/viewing user
  label: string       // display text: "Min booking" | "Anna Hansen" | "Lejl. 2B" | "Optaget"
  canCancel: boolean  // only meaningful when isOwn=true
  machineId: string | null
  machineName: string | null
}

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
