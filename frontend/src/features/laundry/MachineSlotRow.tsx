import { useState } from 'react'
import type { LaundryMachineDto, TimeSlotTemplateDto } from './laundryApi'
import type { GridBooking } from './types'
import { formatTime } from '../../shared/utils/dateUtils'
import { colors } from '../../shared/theme'
import { badge } from './slotBadge'
import { MACHINE_TYPE_LABEL } from './constants'

interface Props {
  slot: TimeSlotTemplateDto
  machines: LaundryMachineDto[]
  bookings: GridBooking[]       // bookings for this slot (one per booked machine)
  past: boolean
  locked: boolean
  maxReached: boolean
  onBook: (machineId: string) => void
  onCancel: (machineId: string) => void
}

export function MachineSlotRow({ slot, machines, bookings, past, locked, maxReached, onBook, onCancel }: Props) {
  const [expanded, setExpanded] = useState(false)

  const timeLabel = `${formatTime(slot.startTime)} – ${formatTime(slot.endTime)}`
  const dimmed = past || locked

  const bookingFor = (machineId: string) => bookings.find((b) => b.machineId === machineId) ?? null
  const freeCount = machines.filter((m) => bookingFor(m.id) === null).length
  const ownCount = bookings.filter((b) => b.isOwn).length
  const canExpand = !past && !locked

  let summary: React.ReactNode
  if (past || locked) {
    summary = (
      <span style={badge(colors.bgSubtle, colors.textMuted)}>
        {past ? 'Passeret' : 'Ikke tilgængeligt'}
      </span>
    )
  } else {
    summary = (
      <span className="d-flex align-items-center gap-2">
        {ownCount > 0 && <span style={badge(colors.successBg, colors.successText)}>Min booking</span>}
        <span style={{ fontSize: '0.8rem', color: freeCount === 0 ? colors.textMuted : colors.textSecondary }}>
          {freeCount === 0 ? 'Fuldt booket' : `${freeCount} af ${machines.length} ledige`}
        </span>
        <svg
          width="12" height="12" viewBox="0 0 14 14" fill="none"
          style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}
        >
          <path d="M2 5l5 5 5-5" stroke={colors.textMuted} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    )
  }

  return (
    <div style={{ borderBottom: `1px solid ${colors.borderRow}` }}>
      <div
        onClick={canExpand ? () => setExpanded((x) => !x) : undefined}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '11px 20px',
          backgroundColor: colors.bgCard,
          opacity: dimmed ? 0.45 : 1,
          cursor: canExpand ? 'pointer' : 'default',
          userSelect: 'none',
        }}
      >
        <span style={{ fontSize: '0.9rem', fontWeight: 500, color: colors.textPrimary }}>{timeLabel}</span>
        {summary}
      </div>

      {expanded && canExpand && (
        <div style={{ backgroundColor: colors.bgPage }}>
          {machines.map((machine) => {
            const booking = bookingFor(machine.id)
            const blocked = maxReached && booking === null

            let action: React.ReactNode
            if (booking?.isOwn) {
              action = booking.canCancel ? (
                <button
                  className="btn btn-sm btn-outline-secondary"
                  style={{ fontSize: '0.75rem', padding: '2px 10px', borderRadius: 20 }}
                  onClick={() => onCancel(machine.id)}
                >
                  Aflys
                </button>
              ) : (
                <span style={{ fontSize: '0.72rem', color: colors.textMuted }}>Aflysfrist udløbet</span>
              )
            } else if (booking) {
              action = <span style={badge(colors.bgSubtle, colors.textSecondary)}>{booking.label}</span>
            } else if (blocked) {
              action = <span style={{ fontSize: '0.72rem', color: colors.textMuted }}>Grænse nået</span>
            } else {
              action = (
                <button
                  className="btn btn-sm btn-outline-primary fw-semibold"
                  style={{ fontSize: '0.78rem', borderRadius: 20, padding: '3px 16px' }}
                  onClick={() => onBook(machine.id)}
                >
                  Book
                </button>
              )
            }

            return (
              <div
                key={machine.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 20px 9px 32px',
                  borderTop: `1px solid ${colors.borderRow}`,
                  backgroundColor: booking?.isOwn ? colors.slotOwnBg : booking ? colors.slotTakenBg : 'transparent',
                }}
              >
                <span style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.86rem', fontWeight: 500, color: colors.textPrimary }}>{machine.name}</span>
                  <span style={{ fontSize: '0.72rem', color: colors.textMuted }}>{MACHINE_TYPE_LABEL[machine.machineType]}</span>
                </span>
                {action}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
