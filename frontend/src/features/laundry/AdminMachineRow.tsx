import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MachineType, useDeleteMachineMutation, type LaundryMachineDto } from './laundryApi'
import { ADMIN_MACHINE_TYPE_LABEL } from './constants'
import { IconDryer, IconWasher } from '../../shared/icons'
import { colors } from '../../shared/theme'
import { extractErrorMessage } from '../../shared/utils/errorUtils'

interface Props {
  machine: LaundryMachineDto
  roomId: string
  propertyId: string
  onEdit: (machine: LaundryMachineDto) => void
  onDeleted: (cancelledBookings: number) => void
}

export function AdminMachineRow({ machine, roomId, propertyId, onEdit, onDeleted }: Props) {
  const { t } = useTranslation()
  const [deleteMachine, { isLoading: deleting }] = useDeleteMachineMutation()
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const Icon = machine.machineType === MachineType.Dryer ? IconDryer : IconWasher

  async function handleDelete() {
    setError(null)
    try {
      const { cancelledBookings } = await deleteMachine({ roomId, machineId: machine.id, propertyId }).unwrap()
      onDeleted(cancelledBookings)
    } catch (err) {
      setError(extractErrorMessage(err, t('common.genericError')))
      setConfirming(false)
    }
  }

  return (
    <li className="d-flex align-items-center gap-3 flex-wrap px-4 py-2" style={{ borderTop: `1px solid ${colors.borderRow}` }}>
      <span
        aria-hidden="true"
        className="d-inline-flex align-items-center justify-content-center flex-shrink-0"
        style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: colors.primaryLight }}
      >
        <Icon size={17} color={colors.primary} />
      </span>
      <span style={{ flex: '1 1 100px', minWidth: 0 }}>
        <span className="d-block" style={{ fontWeight: 500, fontSize: '0.9rem', color: colors.textPrimary, overflowWrap: 'anywhere' }}>{machine.name}</span>
        <span className="d-block" style={{ fontSize: '0.78rem', color: colors.textMuted }}>{t(ADMIN_MACHINE_TYPE_LABEL[machine.machineType])}</span>
        {confirming && machine.upcomingBookingCount > 0 && (
          <span className="d-block" style={{ fontSize: '0.78rem', color: colors.dangerText, marginTop: 2 }}>
            {t('common.upcomingBookingsWillBeCancelled', { count: machine.upcomingBookingCount })}
          </span>
        )}
        {error && <span className="d-block" role="alert" style={{ fontSize: '0.78rem', color: colors.dangerText, marginTop: 2 }}>{error}</span>}
      </span>
      <span className="d-flex align-items-center gap-2 ms-auto">
        {confirming ? (
          <>
            <button type="button" className="btn btn-danger btn-sm" style={{ fontSize: '0.78rem' }} disabled={deleting} onClick={handleDelete}>
              {deleting ? t('adminProperties.laundryRooms.deleting') : t('adminProperties.laundryRooms.confirm')}
            </button>
            <button type="button" className="btn btn-outline-secondary btn-sm" style={{ fontSize: '0.78rem' }} disabled={deleting} onClick={() => setConfirming(false)}>
              {t('common.cancel')}
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              style={{ fontSize: '0.78rem' }}
              aria-label={t('adminProperties.laundryRooms.editNamed', { name: machine.name })}
              onClick={() => onEdit(machine)}
            >
              {t('adminProperties.laundryRooms.edit')}
            </button>
            <button
              type="button"
              className="btn btn-outline-danger btn-sm"
              style={{ fontSize: '0.78rem' }}
              aria-label={t('adminProperties.laundryRooms.deleteNamed', { name: machine.name })}
              onClick={() => setConfirming(true)}
            >
              {t('adminProperties.laundryRooms.delete')}
            </button>
          </>
        )}
      </span>
    </li>
  )
}
