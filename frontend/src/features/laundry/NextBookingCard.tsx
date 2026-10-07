import { useTranslation } from 'react-i18next'
import type { MyBookingDto } from './laundryApi'
import { formatDateFull, formatTimeRange } from '../../shared/utils/dateUtils'
import { colors } from '../../shared/theme'
import { TAP_TARGET_PX } from './constants'
import { useAddToCalendar } from './useAddToCalendar'

interface Props {
  booking: MyBookingDto
  onCancel: (b: MyBookingDto) => void
}

const button: React.CSSProperties = {
  minHeight: TAP_TARGET_PX, padding: '0 18px', borderRadius: 9, cursor: 'pointer', fontSize: '0.88rem',
}

export function NextBookingCard({ booking: b, onCancel }: Props) {
  const { t } = useTranslation()
  const where = [b.roomName, b.machineName].filter(Boolean).join(' · ')
  const slotLabel = `${formatDateFull(b.date)} ${formatTimeRange(b.startTime, b.endTime)}`
  const addToCalendar = useAddToCalendar()

  return (
    <section
      aria-label={t('laundry.next.title')}
      style={{ backgroundColor: colors.chrome, color: colors.chromeText, borderRadius: 14, padding: 20, boxShadow: '0 8px 24px rgba(18,32,26,0.18)' }}
    >
      <p style={{ margin: '0 0 6px', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: colors.chromeMuted }}>
        {t('laundry.next.title')}
      </p>
      <p style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: colors.bgCard, letterSpacing: '-0.3px' }}>
        {formatDateFull(b.date)}
      </p>
      <p style={{ margin: '2px 0 14px', fontSize: '0.92rem' }}>
        {formatTimeRange(b.startTime, b.endTime)} · {where}
      </p>
      <div className="d-flex flex-wrap align-items-center gap-2">
        <button
          type="button"
          onClick={() => addToCalendar(b)}
          aria-label={t('laundry.calendarFile.addAria', { time: slotLabel })}
          style={{ ...button, border: 'none', backgroundColor: colors.bgCard, color: colors.chrome, fontWeight: 700 }}
        >
          {t('laundry.calendarFile.add')}
        </button>
        {b.canCancel ? (
          <button
            type="button"
            onClick={() => onCancel(b)}
            aria-label={t('laundry.actions.cancelSlot', { time: slotLabel })}
            style={{ ...button, border: `1px solid ${colors.chromeBorder}`, background: 'transparent', color: colors.chromeText, fontWeight: 600 }}
          >
            {t('laundry.actions.cancelBooking')}
          </button>
        ) : (
          <span style={{ fontSize: '0.8rem', color: colors.chromeMuted }}>{t('laundry.slot.cancelDeadlinePassed')}</span>
        )}
      </div>
    </section>
  )
}
