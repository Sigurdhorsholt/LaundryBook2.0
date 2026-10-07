import { useTranslation } from 'react-i18next'
import { colors } from '../../shared/theme'
import { OVERVIEW_CARD } from './constants'

interface Props {
  rooms: { id: string; name: string; booked: number; utilization: number }[]
}

export function RoomOccupancyCard({ rooms }: Props) {
  const { t } = useTranslation()
  if (rooms.length === 0) return null

  return (
    <section style={OVERVIEW_CARD}>
      <h2 style={{ margin: '0 0 12px', fontSize: '1rem', fontWeight: 700, color: colors.textPrimary }}>{t('adminOverview.occupancy.title')}</h2>
      <ul className="list-unstyled d-flex flex-column gap-3 mb-0">
        {rooms.map(r => (
          <li key={r.id}>
            <div className="d-flex justify-content-between" style={{ fontSize: '0.86rem', marginBottom: 4 }}>
              <span style={{ color: colors.textPrimary, fontWeight: 600 }}>{r.name}</span>
              <span style={{ color: colors.textSecondary }}>
                {t('adminOverview.occupancy.value', { pct: r.utilization, count: r.booked })}
              </span>
            </div>
            <div
              role="progressbar"
              aria-label={r.name}
              aria-valuenow={r.utilization}
              aria-valuemin={0}
              aria-valuemax={100}
              style={{ height: 8, borderRadius: 999, backgroundColor: colors.slotTakenBg, overflow: 'hidden' }}
            >
              <div style={{ width: `${Math.min(100, r.utilization)}%`, height: '100%', backgroundColor: colors.primary }} />
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
