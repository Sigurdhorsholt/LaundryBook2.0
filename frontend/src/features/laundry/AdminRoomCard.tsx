import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDeleteLaundryRoomMutation, useGetMachinesQuery, type LaundryMachineDto, type LaundryRoomDto } from './laundryApi'
import { AdminMachineRow } from './AdminMachineRow'
import { NoMachinesWarning } from './NoMachinesWarning'
import { IconPlus } from '../../shared/icons'
import { colors } from '../../shared/theme'
import { extractErrorMessage } from '../../shared/utils/errorUtils'

interface Props {
  room: LaundryRoomDto
  propertyId: string
  showNoMachinesWarning: boolean
  onEdit: () => void
  onAddMachine: () => void
  onEditMachine: (machine: LaundryMachineDto) => void
  onDeleted: (cancelledBookings: number) => void
}

const sectionLabel: React.CSSProperties = { fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: colors.textMuted }

// Machines are always listed, with adding one as a visible button, so nothing hides behind an expand
export function AdminRoomCard({ room, propertyId, showNoMachinesWarning, onEdit, onAddMachine, onEditMachine, onDeleted }: Props) {
  const { t } = useTranslation()
  const { data: machines = [], isLoading } = useGetMachinesQuery(room.id)
  const [deleteRoom, { isLoading: deleting }] = useDeleteLaundryRoomMutation()
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const empty = !isLoading && machines.length === 0

  async function handleDelete() {
    setError(null)
    try {
      const { cancelledBookings } = await deleteRoom({ propertyId, roomId: room.id }).unwrap()
      onDeleted(cancelledBookings)
    } catch (err) {
      setError(extractErrorMessage(err, t('common.genericError')))
      setConfirmingDelete(false)
    }
  }

  return (
    <section style={{ border: `1.5px solid ${colors.borderDefault}`, borderRadius: 12, backgroundColor: colors.bgCard, overflow: 'hidden' }}>
      <div className="d-flex align-items-start justify-content-between gap-2 flex-wrap px-4 pt-3 pb-3">
        <div style={{ minWidth: 0, flex: '1 1 180px' }}>
          <h2 className="mb-0" style={{ fontSize: '1rem', fontWeight: 600, color: colors.textPrimary, overflowWrap: 'anywhere' }}>{room.name}</h2>
          {room.description && <p className="mb-0" style={{ fontSize: '0.82rem', color: colors.textSecondary, marginTop: 2 }}>{room.description}</p>}
        </div>
        {!confirmingDelete && (
          <div className="d-flex gap-2">
            <button type="button" className="btn btn-outline-secondary btn-sm" style={{ fontSize: '0.8rem' }} onClick={onEdit}>
              {t('adminProperties.laundryRooms.editRoom')}
            </button>
            <button type="button" className="btn btn-outline-danger btn-sm" style={{ fontSize: '0.8rem' }} onClick={() => setConfirmingDelete(true)}>
              {t('adminProperties.laundryRooms.delete')}
            </button>
          </div>
        )}
      </div>

      {(confirmingDelete || error) && (
        <div className="d-flex align-items-center gap-2 flex-wrap mx-4 mb-3 p-2 rounded-2" style={confirmingDelete ? { backgroundColor: colors.dangerBg, border: `1px solid ${colors.dangerBorder}` } : undefined}>
          {error && <span role="alert" style={{ fontSize: '0.82rem', color: colors.dangerText }}>{error}</span>}
          {confirmingDelete && (
            <>
              <span style={{ flex: '1 1 220px', fontSize: '0.82rem', color: colors.textPrimary }}>
                {room.upcomingBookingCount > 0
                  ? t('common.upcomingBookingsWillBeCancelled', { count: room.upcomingBookingCount })
                  : t('adminProperties.laundryRooms.deleteRoomHint', { room: room.name })}
              </span>
              <button type="button" className="btn btn-danger btn-sm" style={{ fontSize: '0.8rem' }} disabled={deleting} onClick={handleDelete}>
                {deleting ? t('adminProperties.laundryRooms.deleting') : t('adminProperties.laundryRooms.confirmDelete')}
              </button>
              <button type="button" className="btn btn-outline-secondary btn-sm" style={{ fontSize: '0.8rem' }} disabled={deleting} onClick={() => setConfirmingDelete(false)}>
                {t('common.cancel')}
              </button>
            </>
          )}
        </div>
      )}

      {showNoMachinesWarning && <div className="px-4 pb-3"><NoMachinesWarning /></div>}

      <div style={{ borderTop: `1px solid ${colors.borderRow}`, backgroundColor: colors.bgSubtle }}>
        <h3 className="px-4 pt-3 pb-2 mb-0" style={sectionLabel}>
          {t('adminProperties.laundryRooms.machinesHeading', { count: isLoading ? room.machineCount : machines.length })}
        </h3>
        {/* The no-machines warning above already says this when machines are required */}
        {empty && !showNoMachinesWarning && <p className="px-4 pb-2 mb-0" style={{ fontSize: '0.85rem', color: colors.textMuted }}>{t('adminProperties.laundryRooms.noMachines')}</p>}
        {machines.length > 0 && (
          <ul className="list-unstyled mb-0" style={{ backgroundColor: colors.bgCard }}>
            {machines.map((m) => (
              <AdminMachineRow key={m.id} machine={m} roomId={room.id} propertyId={propertyId} onEdit={onEditMachine} onDeleted={onDeleted} />
            ))}
          </ul>
        )}
        <div className="px-4 py-3" style={{ borderTop: machines.length > 0 ? `1px solid ${colors.borderRow}` : undefined }}>
          <button
            type="button"
            className={`btn btn-sm d-inline-flex align-items-center gap-2 fw-semibold ${empty ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={onAddMachine}
          >
            <IconPlus size={14} />
            {t('adminProperties.laundryRooms.addMachine')}
          </button>
        </div>
      </div>
    </section>
  )
}
