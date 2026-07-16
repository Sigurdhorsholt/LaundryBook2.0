import { useTranslation } from 'react-i18next'
import { weekLabel, monthShort } from '../../shared/utils/dateUtils'
import { colors } from '../../shared/theme'
import { IconChevronLeft, IconChevronRight } from '../../shared/icons'

interface Props {
  weekStart: string
  weekFrom: string
  weekTo: string
  canGoBack: boolean
  onShift: (delta: number) => void
}

export function WeekNavigator({ weekStart, weekFrom, weekTo, canGoBack, onShift }: Props) {
  const { t } = useTranslation()
  const fromMonth  = monthShort(parseInt(weekFrom.split('-')[1] ?? '1', 10) - 1)
  const toMonth    = monthShort(parseInt(weekTo.split('-')[1]   ?? '1', 10) - 1)
  const fromDay    = weekFrom.slice(8).replace(/^0/, '')
  const toDay      = weekTo.slice(8).replace(/^0/, '')

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderBottom: `1px solid ${colors.borderRow}`, backgroundColor: colors.bgHeader }}>
      <button
        className="lb-btn lb-btn-ghost lb-icon-btn"
        aria-label={t('laundry.calendar.prevWeek')}
        onClick={() => onShift(-1)}
        disabled={!canGoBack}
      >
        <IconChevronLeft size={15} strokeWidth={2} />
      </button>
      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: colors.textPrimary }}>
        {weekLabel(weekStart)}
        <span style={{ fontWeight: 400, color: colors.textSecondary, marginLeft: 8, fontSize: '0.82rem', fontVariantNumeric: 'tabular-nums' }}>
          {fromDay}. {fromMonth} – {toDay}. {toMonth}
        </span>
      </span>
      <button
        className="lb-btn lb-btn-ghost lb-icon-btn"
        aria-label={t('laundry.calendar.nextWeek')}
        onClick={() => onShift(1)}
      >
        <IconChevronRight size={15} strokeWidth={2} />
      </button>
    </div>
  )
}
