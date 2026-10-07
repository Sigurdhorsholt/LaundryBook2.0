import { useTranslation } from 'react-i18next'
import type { LaundryMachineDto, LaundryRoomDto } from './laundryApi'
import { colors } from '../../shared/theme'
import { MACHINE_TYPE_LABEL, SIDE_CARD } from './constants'

interface Props {
  room: LaundryRoomDto
  machines: LaundryMachineDto[]
  lookaheadDays: number
  maxBookings: number
  cancellationWindowMinutes: number
}

const subTitle: React.CSSProperties = {
  margin: '14px 0 6px', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em',
  textTransform: 'uppercase', color: colors.textMuted,
}

export function RoomInfoCard({ room, machines, lookaheadDays, maxBookings, cancellationWindowMinutes }: Props) {
  const { t } = useTranslation()
  const cancelHours = Math.round(cancellationWindowMinutes / 60)

  return (
    <section style={SIDE_CARD}>
      <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: colors.textPrimary }}>{room.name}</h2>
      {room.description && (
        <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: colors.textMuted }}>{room.description}</p>
      )}

      {machines.length > 0 && (
        <>
          <h3 style={subTitle}>{t('laundry.room.machinesTitle')}</h3>
          <ul className="list-unstyled d-flex flex-column gap-1 mb-0" style={{ fontSize: '0.88rem', color: colors.textPrimary }}>
            {machines.map(m => (
              <li key={m.id} className="d-flex justify-content-between gap-2">
                <span>{m.name}</span>
                <span style={{ color: colors.textMuted }}>{t(MACHINE_TYPE_LABEL[m.machineType])}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      <h3 style={subTitle}>{t('laundry.room.rulesTitle')}</h3>
      <ul className="mb-0 ps-3 d-flex flex-column gap-1" style={{ fontSize: '0.85rem', color: colors.textSecondary }}>
        <li>{t('laundry.room.lookahead', { count: lookaheadDays })}</li>
        <li>{t('laundry.room.maxBookings', { count: maxBookings })}</li>
        <li>{cancelHours > 0 ? t('laundry.room.cancelHours', { count: cancelHours }) : t('laundry.room.cancelUntilStart')}</li>
      </ul>
    </section>
  )
}
