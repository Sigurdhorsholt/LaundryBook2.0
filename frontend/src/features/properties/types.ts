import type { AdminBookingDto } from '../laundry/laundryApi'

export interface TodayBooking extends AdminBookingDto {
  status: 'done' | 'now' | 'later'
}

export type OverviewAttentionItem =
  | { kind: 'pendingInvites'; count: number }
  | { kind: 'noSlots'; roomName: string }
  | { kind: 'noMachines'; roomName: string }
