import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MachineType, type LaundryMachineDto, type TimeSlotTemplateDto } from './laundryApi'
import type { GridBooking, PendingAction } from './types'
import { formatTime } from '../../shared/utils/dateUtils'
import { colors } from '../../shared/theme'
import { badge } from './slotBadge'
import { MACHINE_TYPE_LABEL } from './constants'
import { IconClock, IconChevronDown, IconWasher, IconDryer } from '../../shared/icons'
import { InlineConfirm, ConfirmMessage } from './InlineConfirm'

interface Props {
  slot: TimeSlotTemplateDto
  machines: LaundryMachineDto[]
  bookings: GridBooking[]       // bookings for this slot (one per booked machine)
  past: boolean
  locked: boolean
  maxReached: boolean
  onBook: (machineId: string) => void
  onCancel: (machineId: string) => void
  pending?: PendingAction | null   // armed inline confirm for this slot, matched by the grid
  confirmLoading?: boolean
  confirmError?: string | null
  onConfirm?: () => void
  onDismissConfirm?: () => void
}

function MachineIcon({ type, color }: { type: MachineType; color: string }) {
  return type === MachineType.Dryer
    ? <IconDryer size={18} color={color} strokeWidth={1.8} />
    : <IconWasher size={18} color={color} strokeWidth={1.8} />
}

export function MachineSlotRow({
  slot, machines, bookings, past, locked, maxReached, onBook, onCancel,
  pending, confirmLoading, confirmError, onConfirm, onDismissConfirm,
}: Props) {
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState(false)

  const timeLabel = `${formatTime(slot.startTime)} – ${formatTime(slot.endTime)}`
  const dimmed = past || locked

  const bookingFor = (machineId: string) => bookings.find((b) => b.machineId === machineId) ?? null
  const freeCount = machines.filter((m) => bookingFor(m.id) === null).length
  const ownCount = bookings.filter((b) => b.isOwn).length
  const canExpand = !past && !locked

  return (
    <div style={{ borderBottom: `1px solid ${colors.borderRow}` }}>
      <div
        onClick={canExpand ? () => setExpanded((x) => !x) : undefined}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 12, padding: '11px 20px', backgroundColor: colors.bgCard,
          opacity: dimmed ? 0.45 : 1, cursor: canExpand ? 'pointer' : 'default', userSelect: 'none',
        }}
      >
        <span className="d-flex align-items-center" style={{ gap: 8 }}>
          <IconClock size={15} color={colors.textMuted} strokeWidth={1.8} />
          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: colors.textPrimary }}>{timeLabel}</span>
        </span>

        <span className="d-flex align-items-center" style={{ gap: 8 }}>
          {past || locked ? (
            <span style={badge(colors.bgSubtle, colors.textMuted)}>{past ? t('laundry.slot.past') : t('laundry.slot.unavailable')}</span>
          ) : (
            <>
              {ownCount > 0 && <span style={badge(colors.successBg, colors.successText)}>{t('laundry.slot.myBooking')}</span>}
              <span style={badge(freeCount === 0 ? colors.slotTakenBg : colors.slotFreeBg, freeCount === 0 ? colors.slotTakenText : colors.slotFreeText)}>
                {freeCount === 0 ? t('laundry.slot.fullyBooked') : t('laundry.slot.freeCount', { free: freeCount, total: machines.length })}
              </span>
              <span style={{ display: 'inline-flex', transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>
                <IconChevronDown size={14} color={colors.textMuted} strokeWidth={1.8} />
              </span>
            </>
          )}
        </span>
      </div>

      {expanded && canExpand && (
        <div style={{ backgroundColor: colors.bgPage, padding: '8px 12px 10px' }}>
          {machines.map((machine) => {
            const booking = bookingFor(machine.id)
            const blocked = maxReached && booking === null
            const chipBg = booking?.isOwn ? colors.successBg : booking ? colors.slotTakenBg : colors.primaryLight
            const chipColor = booking?.isOwn ? colors.successText : booking ? colors.slotTakenText : colors.primary

            const machinePending = pending?.machineId === machine.id && onConfirm && onDismissConfirm ? pending : null

            let action: React.ReactNode
            if (booking?.isOwn) {
              action = (
                <span className="d-flex align-items-center" style={{ gap: 8 }}>
                  <span style={badge(colors.successBg, colors.successText)}>{t('laundry.slot.myBooking')}</span>
                  {machinePending?.type === 'cancel' ? (
                    <InlineConfirm variant="cancel" loading={!!confirmLoading} onConfirm={onConfirm!} onDismiss={onDismissConfirm!} />
                  ) : booking.canCancel ? (
                    <button className="lb-btn lb-btn-ghost" style={{ fontSize: '0.75rem', padding: '6px 14px' }} onClick={() => onCancel(machine.id)}>{t('laundry.actions.cancelBooking')}</button>
                  ) : (
                    <span style={{ fontSize: '0.72rem', color: colors.textMuted }}>{t('laundry.slot.deadlinePassed')}</span>
                  )}
                </span>
              )
            } else if (booking) {
              action = <span style={badge(colors.slotTakenBg, colors.slotTakenText)}>{booking.label}</span>
            } else if (blocked) {
              action = <span style={badge(colors.slotWarningBg, colors.slotWarningText)}>{t('laundry.slot.limitReached')}</span>
            } else if (machinePending?.type === 'book') {
              action = <InlineConfirm variant="book" loading={!!confirmLoading} onConfirm={onConfirm!} onDismiss={onDismissConfirm!} />
            } else {
              action = (
                <button className="lb-btn lb-btn-primary" style={{ fontSize: '0.78rem', padding: '7px 18px' }} onClick={() => onBook(machine.id)}>{t('laundry.actions.book')}</button>
              )
            }

            return (
              <div
                key={machine.id}
                style={{
                  marginTop: 6, borderRadius: 10,
                  backgroundColor: machinePending?.type === 'book' ? colors.primaryLighter : colors.bgCard,
                  border: `1px solid ${machinePending?.type === 'book' ? colors.primaryBorder : colors.borderDefault}`,
                }}
              >
                <div className="d-flex align-items-center justify-content-between" style={{ gap: 12, padding: '9px 12px' }}>
                  <span className="d-flex align-items-center" style={{ gap: 10, minWidth: 0 }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      width: 34, height: 34, borderRadius: 9, backgroundColor: chipBg, flexShrink: 0,
                    }}>
                      <MachineIcon type={machine.machineType} color={chipColor} />
                    </span>
                    <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                      <span style={{ fontSize: '0.88rem', fontWeight: 600, color: colors.textPrimary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{machine.name}</span>
                      <span style={{ fontSize: '0.72rem', color: colors.textMuted }}>{(t as (k: string) => string)(MACHINE_TYPE_LABEL[machine.machineType])}</span>
                    </span>
                  </span>
                  {action}
                </div>
                {machinePending && (
                  <ConfirmMessage pending={machinePending} error={confirmError ?? null} style={{ padding: '0 12px 8px' }} />
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
