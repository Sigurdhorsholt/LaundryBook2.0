import { useTranslation } from 'react-i18next'
import { weekLabel, monthShort } from '../../shared/utils/dateUtils'
import { TAP_TARGET_PX } from './constants'
import { colors } from '../../shared/theme'

interface Props {
  weekStart: string
  weekFrom: string
  weekTo: string
  canGoBack: boolean
  canGoForward: boolean
  onShift: (delta: number) => void
}

export function WeekNavigator({ weekStart, weekFrom, weekTo, canGoBack, canGoForward, onShift }: Props) {
  const { t } = useTranslation()
  const fromMonth  = monthShort(parseInt(weekFrom.split('-')[1] ?? '1', 10) - 1)
  const toMonth    = monthShort(parseInt(weekTo.split('-')[1]   ?? '1', 10) - 1)
  const fromDay    = weekFrom.slice(8).replace(/^0/, '')
  const toDay      = weekTo.slice(8).replace(/^0/, '')

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: `1px solid ${colors.borderRow}`, backgroundColor: colors.bgHeader }}>
      <button
        className="btn btn-sm btn-outline-secondary"
        style={{ borderRadius: 20, padding: '0 14px', fontSize: '0.85rem', minHeight: TAP_TARGET_PX, minWidth: TAP_TARGET_PX }}
        onClick={() => onShift(-1)}
        disabled={!canGoBack}
        aria-label={t('laundry.calendar.prevWeek')}
      ><span aria-hidden="true">←</span></button>
      <span style={{ fontWeight: 600, fontSize: '0.88rem', color: colors.textPrimary }}>
        {weekLabel(weekStart)}
        <span style={{ fontWeight: 400, color: colors.slotTakenText, marginLeft: 8, fontSize: '0.82rem' }}>
          {fromDay}. {fromMonth} – {toDay}. {toMonth}
        </span>
      </span>
      <button
        className="btn btn-sm btn-outline-secondary"
        style={{ borderRadius: 20, padding: '0 14px', fontSize: '0.85rem', minHeight: TAP_TARGET_PX, minWidth: TAP_TARGET_PX }}
        onClick={() => onShift(1)}
        disabled={!canGoForward}
        aria-label={t('laundry.calendar.nextWeek')}
      ><span aria-hidden="true">→</span></button>
    </div>
  )
}
