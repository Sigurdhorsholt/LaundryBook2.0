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

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { LaundryMachineDto, TimeSlotTemplateDto } from './laundryApi'
import type { GridBooking, MachineFilter, PendingAction } from './types'
import { machineMatches } from './utils'
import { BookingMode } from '../properties/propertiesApi'
import { isPast, isLocked } from '../../shared/utils/dateUtils'
import { colors } from '../../shared/theme'
import { SlotRow } from './SlotRow'
import { MachineSlotRow } from './MachineSlotRow'
import { IconChevronDown } from '../../shared/icons'
import { TAP_TARGET_PX } from './constants'

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
  machineFilter?: MachineFilter
  onBook: (slotId: string, machineId?: string) => void
  onCancel: (slotId: string, machineId?: string) => void
  loading?: boolean            // shows skeleton rows while slots are fetched
  // Optional inline confirm: when provided, the armed row shows a ✗/✓ pair instead
  // of the parent opening a modal.
  pending?: PendingAction | null
  confirmLoading?: boolean
  confirmError?: string | null
  onConfirm?: () => void
  onDismissConfirm?: () => void
  usage?: { used: number; max: number }
}

// ── Skeleton row ───────────────────────────────────────────────────────────────

function SlotSkeleton() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '11px 20px',
        borderBottom: `1px solid ${colors.borderRow}`,
      }}
    >
      <div
        style={{
          width: 80, height: 14, borderRadius: 4,
          backgroundColor: colors.borderDefault,
          animation: 'skeleton-pulse 1.4s ease-in-out infinite',
        }}
      />
      <div
        style={{
          width: 64, height: 28, borderRadius: 20,
          backgroundColor: colors.borderDefault,
          animation: 'skeleton-pulse 1.4s ease-in-out infinite',
        }}
      />
    </div>
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
  machineFilter = 'all',
  onBook,
  onCancel,
  loading,
  pending,
  confirmLoading,
  confirmError,
  onConfirm,
  onDismissConfirm,
  usage,
}: BookingGridProps) {
  const { t } = useTranslation()
  const [showPast, setShowPast] = useState(false)
  if (loading) {
    return (
      <div>
        {Array.from({ length: 8 }, (_, i) => <SlotSkeleton key={i} />)}
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
  // The filter narrows the machines on offer, but the resident's own booking always stays in view
  const slotMachines = (slotId: string) => machines.filter((m) =>
    machineMatches(m, machineFilter) || slotBookings(slotId).some((b) => b.isOwn && b.machineId === m.id))

  // Today's finished slots fold into one row so the bookable ones show without scrolling on a phone
  const firstOpen = date === today ? slots.findIndex((s) => !isPast(date, s.startTime, today)) : 0
  const pastCount = firstOpen === -1 ? slots.length : firstOpen
  const canCollapsePast = pastCount >= 2
  const hidePast = canCollapsePast && !showPast

  const allUnavailable = slots.every((slot) => {
    const past = isPast(date, slot.startTime, today)
    const locked = isLocked(date, today, bookingLookaheadDays)
    if (past || locked) return true
    if (machineMode) {
      const booked = slotBookings(slot.id)
      return slotMachines(slot.id).every((m) => booked.some((b) => b.machineId === m.id))
    }
    return slotBookings(slot.id).length > 0
  })

  return (
    <div>
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

      {canCollapsePast && (
        <button
          type="button"
          aria-expanded={showPast}
          onClick={() => setShowPast((x) => !x)}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
            minHeight: TAP_TARGET_PX + 4, padding: '0 20px', border: 'none', borderBottom: `1px solid ${colors.borderRow}`,
            backgroundColor: colors.bgSubtle, color: colors.textMuted, fontSize: '0.85rem', textAlign: 'left', cursor: 'pointer',
          }}
        >
          <span>{t('laundry.grid.pastCollapsed', { count: pastCount })}</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 600, color: colors.primary }}>
            {showPast ? t('laundry.grid.hidePast') : t('laundry.grid.showPast')}
            <span aria-hidden="true" style={{ display: 'inline-flex', transform: showPast ? 'rotate(180deg)' : 'none' }}>
              <IconChevronDown size={14} color={colors.primary} strokeWidth={2} />
            </span>
          </span>
        </button>
      )}

      {slots.map((slot, i) => {
        if (hidePast && i < pastCount) return null
        const past = isPast(date, slot.startTime, today)
        const locked = isLocked(date, today, bookingLookaheadDays)
        const slotPending = pending && pending.slotId === slot.id && pending.date === date ? pending : null

        if (machineMode) {
          return (
            <MachineSlotRow
              key={slot.id}
              slot={slot}
              machines={slotMachines(slot.id)}
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
              usage={usage}
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
            usage={usage}
          />
        )
      })}
    </div>
  )
}
