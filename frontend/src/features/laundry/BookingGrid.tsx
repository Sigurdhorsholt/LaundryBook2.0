/**
 * BookingGrid — reusable day-view booking component.
 *
 * Renders one of two layouts depending on the complex's BookingMode:
 *   - BookEntireRoom     → one bookable row per time slot (SlotRow)
 *   - BookSpecificMachine → time-slot rows that expand to a machine picker (MachineSlotRow)
 *
 * The parent computes GridBooking[] for the selected date+room and owns the data source.
 * The grid only handles rendering and the date-based past/locked states.
 */

import { useTranslation } from 'react-i18next'
import type { LaundryMachineDto, TimeSlotTemplateDto } from './laundryApi'
import type { GridBooking, PendingAction } from './types'
import { BookingMode } from '../properties/propertiesApi'
import { isPast, isLocked, formatTime } from '../../shared/utils/dateUtils'
import { colors } from '../../shared/theme'
import { SlotRow } from './SlotRow'
import { MachineSlotRow } from './MachineSlotRow'

export type { GridBooking }

interface BookingGridProps {
  slots: TimeSlotTemplateDto[]
  date: string                 // "YYYY-MM-DD" — which day to render
  today: string                // "YYYY-MM-DD" — used for past/locked logic
  bookingLookaheadDays: number
  gridBookings: GridBooking[]  // pre-computed for this date+room combination
  maxReached: boolean          // active user has hit their concurrent booking limit
  bookingMode: BookingMode
  machines: LaundryMachineDto[]  // active machines; only used in BookSpecificMachine mode
  onBook: (slotId: string, machineId?: string) => void
  onCancel: (slotId: string, machineId?: string) => void
  loading?: boolean            // no slot structure yet — full shimmer skeleton
  statusesLoading?: boolean    // slots known but bookings not yet — real times, shimmer statuses
  refreshing?: boolean         // background refetch — thin progress bar over current content
  // Optional inline confirm: when provided, the armed row shows a ✗/✓ pair instead
  // of the parent opening a modal.
  pending?: PendingAction | null
  confirmLoading?: boolean
  confirmError?: string | null
  onConfirm?: () => void
  onDismissConfirm?: () => void
}

// ── Skeleton rows ──────────────────────────────────────────────────────────────

function SkeletonRowShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 20px', minHeight: 54, borderBottom: `1px solid ${colors.borderRow}`,
      }}
    >
      {children}
    </div>
  )
}

function SlotSkeleton() {
  return (
    <SkeletonRowShell>
      <div className="lb-skeleton" style={{ width: 96, height: 15 }} />
      <div className="lb-skeleton" style={{ width: 72, height: 30, borderRadius: 999 }} />
    </SkeletonRowShell>
  )
}

function StatusSkeletonRow({ slot }: { slot: TimeSlotTemplateDto }) {
  return (
    <SkeletonRowShell>
      <span style={{ fontSize: '0.92rem', fontWeight: 500, fontVariantNumeric: 'tabular-nums', color: colors.textPrimary }}>
        {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
      </span>
      <div className="lb-skeleton" style={{ width: 72, height: 30, borderRadius: 999 }} />
    </SkeletonRowShell>
  )
}

// ── Component ──────────────────────────────────────────────────────────────────

export function BookingGrid({
  slots,
  date,
  today,
  bookingLookaheadDays,
  gridBookings,
  maxReached,
  bookingMode,
  machines,
  onBook,
  onCancel,
  loading,
  statusesLoading,
  refreshing,
  pending,
  confirmLoading,
  confirmError,
  onConfirm,
  onDismissConfirm,
}: BookingGridProps) {
  const { t } = useTranslation()
  if (loading) {
    return (
      <div>
        <div className="lb-progress" />
        {Array.from({ length: 8 }, (_, i) => <SlotSkeleton key={i} />)}
      </div>
    )
  }

  if (statusesLoading && slots.length > 0) {
    return (
      <div>
        <div className="lb-progress" />
        {slots.map((slot) => <StatusSkeletonRow key={slot.id} slot={slot} />)}
      </div>
    )
  }

  if (slots.length === 0) {
    return (
      <div style={{ padding: '32px 20px', textAlign: 'center' }}>
        <p style={{ color: colors.textPrimary, fontWeight: 600, marginBottom: 4, fontSize: '0.9rem' }}>
          {t('laundry.grid.noSlotsTitle')}
        </p>
        <p style={{ color: colors.textMuted, fontSize: '0.82rem', marginBottom: 0 }}>
          {t('laundry.grid.noSlotsDescription')}
        </p>
      </div>
    )
  }

  const machineMode = bookingMode === BookingMode.BookSpecificMachine

  if (machineMode && machines.length === 0) {
    return (
      <div style={{ padding: '32px 20px', textAlign: 'center' }}>
        <p style={{ color: colors.textPrimary, fontWeight: 600, marginBottom: 4, fontSize: '0.9rem' }}>
          {t('laundry.grid.noMachinesTitle')}
        </p>
        <p style={{ color: colors.textMuted, fontSize: '0.82rem', marginBottom: 0 }}>
          {t('laundry.grid.noMachinesDescription')}
        </p>
      </div>
    )
  }

  const slotBookings = (slotId: string) => gridBookings.filter((b) => b.slotId === slotId)

  const allUnavailable = slots.every((slot) => {
    const past = isPast(date, slot.startTime, today)
    const locked = isLocked(date, today, bookingLookaheadDays)
    if (past || locked) return true
    if (machineMode) {
      const booked = slotBookings(slot.id)
      return machines.every((m) => booked.some((b) => b.machineId === m.id))
    }
    return slotBookings(slot.id).length > 0
  })

  return (
    <div>
      {refreshing ? <div className="lb-progress" /> : <div style={{ height: 2 }} />}
      {maxReached && (
        <div
          style={{
            padding: '10px 20px',
            fontSize: '0.82rem',
            display: 'flex',
            gap: 6,
            flexWrap: 'wrap',
            backgroundColor: colors.slotWarningBg,
            borderBottom: `1px solid ${colors.slotWarningBorder}`,
            color: colors.slotWarningText,
          }}
        >
          <strong>{t('laundry.grid.limitReachedTitle')}</strong>
          <span>{t('laundry.grid.limitReachedHint')}</span>
        </div>
      )}

      {!maxReached && allUnavailable && (
        <div
          style={{
            padding: '10px 20px',
            fontSize: '0.82rem',
            backgroundColor: colors.warningBg,
            borderBottom: `1px solid ${colors.slotWarningBorder}`,
            color: colors.slotWarningText,
          }}
        >
          {t('laundry.grid.noAvailableToday')}
        </div>
      )}

      {slots.map((slot) => {
        const past = isPast(date, slot.startTime, today)
        const locked = isLocked(date, today, bookingLookaheadDays)
        const slotPending = pending && pending.slotId === slot.id && pending.date === date ? pending : null

        if (machineMode) {
          return (
            <MachineSlotRow
              key={slot.id}
              slot={slot}
              machines={machines}
              bookings={slotBookings(slot.id)}
              past={past}
              locked={locked}
              maxReached={maxReached}
              onBook={(machineId) => onBook(slot.id, machineId)}
              onCancel={(machineId) => onCancel(slot.id, machineId)}
              pending={slotPending}
              confirmLoading={confirmLoading}
              confirmError={confirmError}
              onConfirm={onConfirm}
              onDismissConfirm={onDismissConfirm}
            />
          )
        }

        const booking = slotBookings(slot.id)[0] ?? null
        const blocked = maxReached && booking === null && !past && !locked

        return (
          <SlotRow
            key={slot.id}
            slot={slot}
            booking={booking}
            past={past}
            locked={locked}
            blocked={blocked}
            onBook={() => onBook(slot.id)}
            onCancel={() => onCancel(slot.id)}
            pending={slotPending}
            confirmLoading={confirmLoading}
            confirmError={confirmError}
            onConfirm={onConfirm}
            onDismissConfirm={onDismissConfirm}
          />
        )
      })}
    </div>
  )
}
