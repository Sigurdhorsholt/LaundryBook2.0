import { useTranslation } from 'react-i18next'
import { MachineType } from '../laundry/laundryApi'
import type { PropertyRoomInfoDto } from './propertiesApi'
import { MACHINE_TYPE_LABEL } from '../laundry/constants'
import { IconDryer, IconWasher } from '../../shared/icons'
import { colors } from '../../shared/theme'
import { OVERVIEW_CARD } from './constants'

export function PropertyRoomsCard({ rooms }: { rooms: PropertyRoomInfoDto[] }) {
  const { t } = useTranslation()

  return (
    <section style={OVERVIEW_CARD}>
      <h2 style={{ margin: '0 0 12px', fontSize: '1rem', fontWeight: 700, color: colors.textPrimary }}>{t('propertyInfo.rooms.title')}</h2>
      {rooms.length === 0 ? (
        <p style={{ margin: 0, fontSize: '0.88rem', color: colors.textMuted }}>{t('propertyInfo.rooms.empty')}</p>
      ) : (
        <div className="row g-3">
          {rooms.map(room => (
            <div key={room.id} className="col-12 col-md-6">
              <div style={{ height: '100%', borderRadius: 10, backgroundColor: colors.bgSubtle, padding: '12px 14px' }}>
                <p className="mb-0 fw-semibold" style={{ fontSize: '0.92rem', color: colors.textPrimary }}>{room.name}</p>
                {room.description && <p className="mb-0" style={{ fontSize: '0.82rem', color: colors.textMuted }}>{room.description}</p>}
                {room.machines.length > 0 && (
                  <ul className="list-unstyled d-flex flex-column gap-1 mb-0 mt-2" style={{ fontSize: '0.86rem' }}>
                    {room.machines.map(m => (
                      <li key={m.name} className="d-flex align-items-center gap-2">
                        <span aria-hidden="true" style={{ display: 'flex', color: colors.primary }}>
                          {m.machineType === MachineType.Dryer ? <IconDryer size={16} /> : <IconWasher size={16} />}
                        </span>
                        <span style={{ color: colors.textPrimary }}>{m.name}</span>
                        <span className="ms-auto" style={{ color: colors.textMuted }}>{t(MACHINE_TYPE_LABEL[m.machineType])}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
