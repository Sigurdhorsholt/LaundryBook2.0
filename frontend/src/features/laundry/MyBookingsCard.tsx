import { useTranslation } from 'react-i18next'
import type { MyBookingDto } from './laundryApi'
import { dayShortLabel, formatDayMonth, formatDateFull, formatTimeRange } from '../../shared/utils/dateUtils'
import { colors } from '../../shared/theme'
import { SIDE_CARD } from './constants'
import { useAddToCalendar } from './useAddToCalendar'

interface Props {
  bookings: MyBookingDto[]
  used: number
  max: number
  today: string
  onCancel: (b: MyBookingDto) => void
}

export function MyBookingsCard({ bookings, used, max, today, onCancel }: Props) {
  const { t } = useTranslation()
  const pct = max > 0 ? Math.min(100, Math.round((used / max) * 100)) : 0
  const addToCalendar = useAddToCalendar()

  return (
    <section style={SIDE_CARD}>
      <div className="d-flex justify-content-between align-items-baseline gap-2">
        <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: colors.textPrimary }}>{t('laundry.mine.title')}</h2>
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: colors.textSecondary }}>{t('laundry.mine.used', { used, max })}</span>
      </div>
      <div
        role="progressbar"
        aria-label={t('laundry.mine.used', { used, max })}
        aria-valuenow={used}
        aria-valuemin={0}
        aria-valuemax={max}
        style={{ height: 6, borderRadius: 999, backgroundColor: colors.slotTakenBg, margin: '10px 0 14px', overflow: 'hidden' }}
      >
        <div style={{ width: `${pct}%`, height: '100%', backgroundColor: colors.primary }} />
      </div>

      {bookings.length === 0 ? (
        <p style={{ margin: 0, fontSize: '0.88rem', color: colors.textMuted }}>{t('laundry.mine.empty')}</p>
      ) : (
        <ul className="list-unstyled d-flex flex-column gap-2 mb-0">
          {bookings.map(b => (
            <li key={b.id} className="d-flex justify-content-between align-items-center gap-2" style={{ fontSize: '0.88rem', color: colors.textPrimary }}>
              <span>
                <strong>{dayShortLabel(b.date, today)} {formatDayMonth(b.date)}</strong> · {formatTimeRange(b.startTime, b.endTime)}
                <span style={{ display: 'block', fontSize: '0.78rem', color: colors.textMuted }}>
                  {[b.roomName, b.machineName].filter(Boolean).join(' · ')}
                </span>
              </span>
              <span className="d-flex flex-shrink-0">
                <button
                  type="button"
                  className="btn btn-sm btn-link p-1"
                  style={{ fontSize: '0.8rem', color: colors.primary }}
                  aria-label={t('laundry.calendarFile.addAria', { time: `${formatDateFull(b.date)} ${formatTimeRange(b.startTime, b.endTime)}` })}
                  onClick={() => addToCalendar(b)}
                >
                  {t('laundry.calendarFile.addShort')}
                </button>
                {b.canCancel && (
                  <button
                    type="button"
                    className="btn btn-sm btn-link p-1"
                    style={{ fontSize: '0.8rem', color: colors.dangerText }}
                    aria-label={t('laundry.actions.cancelSlot', { time: `${formatDateFull(b.date)} ${formatTimeRange(b.startTime, b.endTime)}` })}
                    onClick={() => onCancel(b)}
                  >
                    {t('laundry.actions.cancelBooking')}
                  </button>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
      <p style={{ margin: '14px 0 0', fontSize: '0.78rem', color: colors.textMuted }}>{t('laundry.mine.countsHint')}</p>
    </section>
  )
}
