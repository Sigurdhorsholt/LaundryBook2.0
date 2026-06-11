import { weekLabel, MONTH_SHORT } from '../../shared/utils/dateUtils'
import { colors } from '../../shared/theme'

interface Props {
  weekStart: string
  weekFrom: string
  weekTo: string
  canGoBack: boolean
  onShift: (delta: number) => void
}

export function WeekNavigator({ weekStart, weekFrom, weekTo, canGoBack, onShift }: Props) {
  const fromMonth  = MONTH_SHORT[parseInt(weekFrom.split('-')[1] ?? '1', 10) - 1] ?? ''
  const toMonth    = MONTH_SHORT[parseInt(weekTo.split('-')[1]   ?? '1', 10) - 1] ?? ''
  const fromDay    = weekFrom.slice(8).replace(/^0/, '')
  const toDay      = weekTo.slice(8).replace(/^0/, '')

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: `1px solid ${colors.borderRow}`, backgroundColor: colors.bgHeader }}>
      <button
        className="btn btn-sm btn-outline-secondary"
        style={{ borderRadius: 20, padding: '2px 12px', fontSize: '0.8rem' }}
        onClick={() => onShift(-1)}
        disabled={!canGoBack}
      >←</button>
      <span style={{ fontWeight: 600, fontSize: '0.88rem', color: colors.textPrimary }}>
        {weekLabel(weekStart)}
        <span style={{ fontWeight: 400, color: colors.slotTakenText, marginLeft: 8, fontSize: '0.82rem' }}>
          {fromDay}. {fromMonth} – {toDay}. {toMonth}
        </span>
      </span>
      <button
        className="btn btn-sm btn-outline-secondary"
        style={{ borderRadius: 20, padding: '2px 12px', fontSize: '0.8rem' }}
        onClick={() => onShift(1)}
      >→</button>
    </div>
  )
}
