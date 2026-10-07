import { useTranslation } from 'react-i18next'
import type { AdminBookingDto } from './laundryApi'
import { formatDateFull, formatTimeRange, isPast } from '../../shared/utils/dateUtils'
import { colors } from '../../shared/theme'
import { SIDE_CARD } from './constants'

interface Props {
  booking: AdminBookingDto | null
  today: string
  onCancel: (b: AdminBookingDto) => void
}

export function AdminBookingDetailPanel({ booking: b, today, onCancel }: Props) {
  const { t } = useTranslation()
  const started = b ? isPast(b.date, b.startTime, today) : false

  return (
    // Live region so a screen reader hears which booking the calendar click selected
    <section aria-live="polite" style={SIDE_CARD}>
      <h2 style={{ margin: '0 0 10px', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: colors.textMuted }}>
        {t('adminProperties.bookings.selected.title')}
      </h2>

      {!b ? (
        <p style={{ margin: 0, fontSize: '0.88rem', color: colors.textMuted }}>{t('adminProperties.bookings.selected.empty')}</p>
      ) : (
        <>
          <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: colors.textPrimary, letterSpacing: '-0.3px' }}>{formatDateFull(b.date)}</p>
          <p style={{ margin: '2px 0 14px', fontSize: '0.9rem', color: colors.textSecondary }}>
            {[formatTimeRange(b.startTime, b.endTime), b.roomName, b.machineName].filter(Boolean).join(' · ')}
          </p>
          <dl className="mb-3" style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '6px 14px', fontSize: '0.88rem' }}>
            <dt style={{ fontWeight: 500, color: colors.textMuted }}>{t('adminProperties.bookings.selected.resident')}</dt>
            <dd className="mb-0" style={{ color: colors.textPrimary, fontWeight: 600 }}>{b.residentName}</dd>
            {b.apartmentNumber && (
              <>
                <dt style={{ fontWeight: 500, color: colors.textMuted }}>{t('adminProperties.bookings.selected.apartment')}</dt>
                <dd className="mb-0" style={{ color: colors.textPrimary }}>{b.apartmentNumber}</dd>
              </>
            )}
          </dl>
          {started ? (
            <p style={{ margin: 0, fontSize: '0.82rem', color: colors.textMuted }}>{t('adminProperties.bookings.selected.started')}</p>
          ) : (
            <button
              type="button"
              className="btn btn-danger w-100 fw-semibold"
              style={{ minHeight: 44, borderRadius: 10 }}
              onClick={() => onCancel(b)}
            >
              {t('adminProperties.bookings.selected.cancel')}
            </button>
          )}
        </>
      )}
    </section>
  )
}
