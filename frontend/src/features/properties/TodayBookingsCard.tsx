import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { TodayBooking } from './types'
import { formatTimeRange } from '../../shared/utils/dateUtils'
import { colors } from '../../shared/theme'
import { OVERVIEW_CARD, TODAY_STATUS_STYLE } from './constants'

interface Props {
  bookings: TodayBooking[]
  bookingsPath: string
}

const cell: React.CSSProperties = { padding: '10px 16px', borderTop: `1px solid ${colors.borderRow}`, fontSize: '0.88rem', verticalAlign: 'middle' }
const head: React.CSSProperties = { padding: '8px 16px', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: colors.textMuted, backgroundColor: colors.bgHeader }

export function TodayBookingsCard({ bookings, bookingsPath }: Props) {
  const { t } = useTranslation()

  return (
    <section style={{ ...OVERVIEW_CARD, padding: 0, overflow: 'hidden' }}>
      <div className="d-flex justify-content-between align-items-center gap-2" style={{ padding: '14px 16px' }}>
        <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: colors.textPrimary }}>{t('adminOverview.today.title')}</h2>
        <Link to={bookingsPath} style={{ fontSize: '0.85rem', fontWeight: 600 }}>{t('adminOverview.today.allBookings')}</Link>
      </div>

      {bookings.length === 0 ? (
        <p style={{ margin: 0, padding: '18px 16px 22px', borderTop: `1px solid ${colors.borderRow}`, fontSize: '0.88rem', color: colors.textMuted }}>
          {t('adminOverview.today.empty')}
        </p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 480 }}>
            <thead>
              <tr>
                <th scope="col" style={head}>{t('adminOverview.today.time')}</th>
                <th scope="col" style={head}>{t('adminOverview.today.room')}</th>
                <th scope="col" style={head}>{t('adminOverview.today.resident')}</th>
                <th scope="col" style={head}>{t('adminOverview.today.status')}</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(b => {
                const status = TODAY_STATUS_STYLE[b.status]
                return (
                  <tr key={b.id}>
                    <td style={{ ...cell, fontWeight: 600, whiteSpace: 'nowrap', color: colors.textPrimary }}>{formatTimeRange(b.startTime, b.endTime)}</td>
                    <td style={{ ...cell, color: colors.textSecondary }}>{[b.roomName, b.machineName].filter(Boolean).join(' · ')}</td>
                    <td style={{ ...cell, color: colors.textPrimary }}>
                      {b.apartmentNumber ? `${t('laundry.apartmentShort', { number: b.apartmentNumber })} · ${b.residentName}` : b.residentName}
                    </td>
                    <td style={cell}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, borderRadius: 999, padding: '3px 10px', backgroundColor: status.bg, color: status.color, whiteSpace: 'nowrap' }}>
                        {t(status.labelKey)}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
