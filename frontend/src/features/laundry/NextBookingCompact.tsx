import { useTranslation } from 'react-i18next'
import type { MyBookingDto } from './laundryApi'
import { dayShortLabel, formatDayMonth, formatDateFull, formatTimeRange } from '../../shared/utils/dateUtils'
import { colors } from '../../shared/theme'
import { TAP_TARGET_PX } from './constants'
import { useAddToCalendar } from './useAddToCalendar'
import { IconCalendar } from '../../shared/icons'

interface Props {
  booking: MyBookingDto
  today: string
  used: number
  max: number
  // How many bookings "Se alle" reveals; the toggle is hidden when there is nothing more to see
  totalCount: number
  showAll: boolean
  listId: string
  onToggleAll: () => void
  onCancel: (b: MyBookingDto) => void
}

export function NextBookingCompact({ booking: b, today, used, max, totalCount, showAll, listId, onToggleAll, onCancel }: Props) {
  const { t } = useTranslation()
  const time = formatTimeRange(b.startTime, b.endTime)
  const addToCalendar = useAddToCalendar()

  return (
    <section
      aria-label={t('laundry.next.title')}
      style={{ backgroundColor: colors.chrome, color: colors.chromeText, borderRadius: 16, padding: '14px 16px' }}
    >
      <div className="d-flex justify-content-between align-items-center gap-2">
        <p style={{ margin: 0, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: colors.chromeMuted }}>
          {t('laundry.next.title')}
        </p>
        {totalCount > 1 && (
          <button
            type="button"
            aria-expanded={showAll}
            aria-controls={listId}
            onClick={onToggleAll}
            // Negative margin gives a full-size touch target without making the card's header taller
            style={{ background: 'none', border: 'none', padding: '0 4px', minHeight: TAP_TARGET_PX, margin: '-10px -4px', color: colors.chromeAccent, fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
          >
            {showAll ? t('laundry.next.hideAll') : t('laundry.next.showAll', { count: totalCount })}
          </button>
        )}
      </div>
      <p style={{ margin: '2px 0 0', fontSize: '1.15rem', fontWeight: 800, color: colors.bgCard, letterSpacing: '-0.2px' }}>
        {dayShortLabel(b.date, today)} {formatDayMonth(b.date)} · {time}
      </p>
      <div className="d-flex align-items-center gap-2" style={{ marginTop: 6 }}>
        <span style={{ flex: 1, minWidth: 0, fontSize: '0.85rem' }}>
          {[b.roomName, b.machineName].filter(Boolean).join(' · ')} · {t('laundry.mine.used', { used, max })}
        </span>
        <button
          type="button"
          onClick={() => addToCalendar(b)}
          aria-label={t('laundry.calendarFile.addAria', { time: `${formatDateFull(b.date)} ${time}` })}
          title={t('laundry.calendarFile.add')}
          style={{
            width: TAP_TARGET_PX, height: TAP_TARGET_PX, borderRadius: 10, cursor: 'pointer', flexShrink: 0,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            border: `1px solid ${colors.chromeBorder}`, background: 'transparent', color: colors.chromeText,
          }}
        >
          <IconCalendar size={18} />
        </button>
        {b.canCancel && (
          <button
            type="button"
            onClick={() => onCancel(b)}
            aria-label={t('laundry.actions.cancelSlot', { time: `${formatDateFull(b.date)} ${time}` })}
            style={{
              minHeight: TAP_TARGET_PX, padding: '0 16px', borderRadius: 10, cursor: 'pointer', flexShrink: 0,
              border: `1px solid ${colors.chromeBorder}`, background: 'transparent', color: colors.chromeText,
              fontSize: '0.88rem', fontWeight: 600,
            }}
          >
            {t('laundry.actions.cancelBooking')}
          </button>
        )}
      </div>
    </section>
  )
}
