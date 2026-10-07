import { useTranslation } from 'react-i18next'
import { useGetMachinesQuery, type AdminBookingDto } from './laundryApi'
import { colors } from '../../shared/theme'
import { MACHINE_TYPE_LABEL, SIDE_CARD } from './constants'

interface Props {
  roomId: string
  roomName: string
  bookings: AdminBookingDto[]   // the loaded period, all rooms
  // Bookings only name a machine in machine mode, so per-machine counts mean nothing otherwise
  machineMode: boolean
}

export function AdminRoomMachinesCard({ roomId, roomName, bookings, machineMode }: Props) {
  const { t } = useTranslation()
  const { data: machines = [] } = useGetMachinesQuery(roomId, { skip: !roomId })
  if (machines.length === 0) return null

  const countFor = (name: string) => bookings.filter(b => b.roomId === roomId && b.machineName === name).length

  return (
    <section style={SIDE_CARD}>
      <h2 style={{ margin: '0 0 10px', fontSize: '1rem', fontWeight: 700, color: colors.textPrimary }}>
        {t('adminProperties.bookings.selected.machinesTitle', { room: roomName })}
      </h2>
      <ul className="list-unstyled d-flex flex-column gap-2 mb-0" style={{ fontSize: '0.88rem' }}>
        {machines.map(m => (
          <li key={m.id} className="d-flex justify-content-between gap-2">
            <span style={{ color: colors.textPrimary }}>{m.name}</span>
            <span style={{ color: colors.textMuted }}>
              {machineMode
                ? t('adminProperties.bookings.selected.machineCount', { count: countFor(m.name) })
                : t(MACHINE_TYPE_LABEL[m.machineType])}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
