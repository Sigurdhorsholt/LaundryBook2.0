import { useTranslation } from 'react-i18next'
import type { BookingDto, LaundryMachineDto } from './laundryApi'
import { colors } from '../../shared/theme'

interface Props {
  machine: LaundryMachineDto
  // The resident's own booking on this machine in this slot, if any
  booking: BookingDto | undefined
  free: boolean
  slotLabel: string
  maxReached: boolean
  loading: boolean
  onBook: (machineId: string) => void
  onCancel: (booking: BookingDto) => void
}

const actionButton: React.CSSProperties = { flexShrink: 0, minHeight: 38, padding: '0 14px', borderWidth: 1.5, fontSize: '0.82rem' }

export function WeekPopoverMachineRow({ machine, booking, free, slotLabel, maxReached, loading, onBook, onCancel }: Props) {
  const { t } = useTranslation()
  const yours = t('laundry.week.popover.machineYours')
  const status = booking
    ? (booking.canCancel ? yours : `${yours} · ${t('laundry.slot.cancelDeadlinePassed')}`)
    : free ? t('laundry.week.popover.machineFree') : t('laundry.slot.taken')
  const statusColor = booking ? colors.slotOwnText : free ? colors.primary : colors.textMuted

  return (
    <li className="d-flex align-items-center justify-content-between gap-2" style={{ padding: '8px 0', borderTop: `1px solid ${colors.borderRow}` }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: '0.88rem', fontWeight: 600, color: colors.textPrimary, overflowWrap: 'anywhere' }}>{machine.name}</div>
        <div style={{ fontSize: '0.75rem', color: statusColor }}>{status}</div>
      </div>
      {booking?.canCancel && (
        <button
          type="button"
          className="btn btn-outline-danger fw-semibold"
          style={actionButton}
          disabled={loading}
          aria-label={t('laundry.actions.cancelMachine', { machine: machine.name, time: slotLabel })}
          onClick={() => onCancel(booking)}
        >
          {t('laundry.actions.cancelBooking')}
        </button>
      )}
      {free && (
        <button
          type="button"
          className="btn btn-outline-primary fw-semibold"
          style={actionButton}
          disabled={loading || maxReached}
          aria-label={t('laundry.actions.bookMachine', { machine: machine.name, time: slotLabel })}
          onClick={() => onBook(machine.id)}
        >
          {t('laundry.actions.book')}
        </button>
      )}
    </li>
  )
}
