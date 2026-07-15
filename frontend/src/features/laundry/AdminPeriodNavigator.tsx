import { IconChevronLeft, IconChevronRight } from '../../shared/icons'
import { dayNum, MONTH_SHORT } from '../../shared/utils/dateUtils'
import { colors } from '../../shared/theme'

interface Props {
  from: string          // "YYYY-MM-DD" — first day of the loaded window
  to: string            // "YYYY-MM-DD" — last day of the loaded window
  isCurrent: boolean     // true when the window is the one containing today
  loading?: boolean
  onPrev: () => void
  onNext: () => void
  onJumpToToday: () => void
}

function monthOf(dateStr: string): string {
  return MONTH_SHORT[parseInt(dateStr.slice(5, 7), 10) - 1] ?? ''
}

export function AdminPeriodNavigator({ from, to, isCurrent, loading, onPrev, onNext, onJumpToToday }: Props) {
  const rangeLabel = `${dayNum(from)}. ${monthOf(from)} – ${dayNum(to)}. ${monthOf(to)} ${to.slice(0, 4)}`

  return (
    <div className="d-flex align-items-center gap-2 flex-wrap mb-3">
      <div
        className="d-flex align-items-center"
        style={{ border: `1px solid ${colors.borderStrong}`, borderRadius: 8, backgroundColor: colors.bgCard }}
      >
        <button
          className="btn btn-sm p-1 px-2"
          style={{ color: colors.textPrimary, lineHeight: 1 }}
          onClick={onPrev}
          disabled={loading}
          aria-label="Tidligere periode"
        >
          <IconChevronLeft size={16} />
        </button>
        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: colors.textPrimary, padding: '0 6px', whiteSpace: 'nowrap' }}>
          {rangeLabel}
        </span>
        <button
          className="btn btn-sm p-1 px-2"
          style={{ color: colors.textPrimary, lineHeight: 1 }}
          onClick={onNext}
          disabled={loading}
          aria-label="Senere periode"
        >
          <IconChevronRight size={16} />
        </button>
      </div>

      {!isCurrent && (
        <button
          className="btn btn-sm btn-outline-secondary"
          style={{ borderRadius: 8, fontSize: '0.78rem' }}
          onClick={onJumpToToday}
          disabled={loading}
        >
          Spring til i dag
        </button>
      )}

      {loading && (
        <span style={{ fontSize: '0.78rem', color: colors.textMuted }}>Indlæser…</span>
      )}
    </div>
  )
}
