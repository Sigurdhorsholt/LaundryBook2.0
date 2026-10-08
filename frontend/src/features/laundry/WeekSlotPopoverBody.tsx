import { useTranslation } from 'react-i18next'
import type { BookingDto, TimeSlotTemplateDto } from './laundryApi'
import type { WeekCellContext } from './utils'
import type { OpenWeekCell } from './types'
import { WeekPopoverMachineRow } from './WeekPopoverMachineRow'
import { FormError } from '../../shared/ui'
import { IconClock } from '../../shared/icons'
import { formatDateFull, formatTimeRange, minutesUntilSlot } from '../../shared/utils/dateUtils'
import { colors } from '../../shared/theme'

interface Props {
  titleId: string
  cell: OpenWeekCell
  slot: TimeSlotTemplateDto
  date: string
  context: WeekCellContext
  roomName: string | null
  maxReached: boolean
  loading: boolean
  error: string | null
  onBook: (machineId?: string) => void
  onCancel: (booking: BookingDto) => void
  onClose: () => void
}

// What the week popover says and offers; also shown, inert, in the public site's previews
export function WeekSlotPopoverBody({ titleId, cell, slot, date, context, roomName, maxReached, loading, error, onBook, onCancel, onClose }: Props) {
  const { t } = useTranslation()
  const own = cell.kind === 'own' ? cell.bookings : []
  const { machineMode, machines } = context
  const slotLabel = `${formatDateFull(date)} · ${formatTimeRange(slot.startTime, slot.endTime)}`
  const minutes = minutesUntilSlot(date, slot.startTime)
  const startsSoon = own.some(b => b.canCancel) && minutes >= 0 && minutes < 240
  const canBookMore = cell.kind === 'free' || cell.freeMachines.length > 0
  const title = own.length > 0 ? t('laundry.week.popover.titleOwn')
    : machineMode ? t('laundry.week.popover.titlePick')
    : t('laundry.week.popover.titleBook')
  const dismiss = own.length === 0 ? t('laundry.actions.dismiss')
    : machineMode ? t('common.close')
    : t('laundry.week.popover.keep')
  const spinner = <span className="spinner-border spinner-border-sm" aria-hidden="true" />

  function roomAction() {
    if (own.length === 0) {
      return (
        <button type="button" className="btn btn-primary fw-semibold w-100 mb-2" style={{ minHeight: 44 }} disabled={loading || maxReached} onClick={() => onBook()}>
          {loading ? spinner : t('laundry.actions.bookTime')}
        </button>
      )
    }
    if (!own[0].canCancel) {
      return <p style={{ margin: '0 0 12px', fontSize: '0.85rem', color: colors.textSecondary }}>{t('laundry.slot.cancelDeadlinePassed')}</p>
    }
    return (
      <button type="button" className="btn btn-outline-danger fw-semibold w-100 mb-2" style={{ minHeight: 44, borderWidth: 1.5 }} disabled={loading} onClick={() => onCancel(own[0])}>
        {loading ? spinner : t('laundry.actions.cancelTime')}
      </button>
    )
  }

  return (
    <>
      <p id={titleId} style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: colors.textPrimary }}>{title}</p>
      <p style={{ margin: '2px 0 12px', fontSize: '0.82rem', color: colors.textSecondary }}>
        {[slotLabel, roomName].filter(Boolean).join(' · ')}
      </p>
      {startsSoon && (
        <p
          className="d-flex align-items-center gap-2"
          style={{
            margin: '0 0 12px', padding: '6px 10px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600,
            color: colors.warningText, backgroundColor: colors.warningBg, border: `1px solid ${colors.warningBorder}`,
          }}
        >
          <IconClock size={14} />
          {minutes < 60
            ? t('laundry.confirmBooking.warningMinutes', { count: minutes })
            : t('laundry.confirmBooking.warningHours', { count: Math.floor(minutes / 60) })}
        </p>
      )}
      <FormError message={error} />
      {machineMode ? (
        <ul style={{ listStyle: 'none', margin: '0 0 12px', padding: 0 }}>
          {machines.map(m => (
            <WeekPopoverMachineRow
              key={m.id}
              machine={m}
              booking={own.find(b => b.machineId === m.id)}
              free={cell.freeMachines.some(f => f.id === m.id)}
              slotLabel={slotLabel}
              maxReached={maxReached}
              loading={loading}
              onBook={onBook}
              onCancel={onCancel}
            />
          ))}
        </ul>
      ) : roomAction()}
      {maxReached && canBookMore && (
        <p style={{ margin: '0 0 8px', fontSize: '0.78rem', color: colors.textSecondary }}>{t('laundry.grid.limitReachedHint')}</p>
      )}
      <button type="button" className="btn btn-outline-secondary w-100" style={{ minHeight: 40 }} disabled={loading} onClick={onClose}>
        {dismiss}
      </button>
    </>
  )
}
