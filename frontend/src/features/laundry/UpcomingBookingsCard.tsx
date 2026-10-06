import { useTranslation } from 'react-i18next'
import type { MyBookingDto } from './laundryApi'
import type { PendingAction } from './types'
import { dayShortLabel, dayNum, formatTimeRange, formatDateFull, monthShort } from '../../shared/utils/dateUtils'
import { colors } from '../../shared/theme'
import { TAP_TARGET_PX } from './constants'

interface Props {
  myBookings: MyBookingDto[]
  today: string
  expanded: boolean
  onToggle: () => void
  onCancelUpcoming: (b: MyBookingDto) => void
}

export function UpcomingBookingsCard({ myBookings, today, expanded, onToggle, onCancelUpcoming }: Props) {
  const { t } = useTranslation()
  if (myBookings.length === 0) return null

  return (
    <div className="rounded-3 mb-4" style={{ border: `1px solid ${colors.borderDefault}`, backgroundColor: colors.bgCard, overflow: 'hidden' }}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 20px', border: 'none', borderBottom: expanded ? `1px solid ${colors.borderRow}` : 'none',
          backgroundColor: colors.bgHeader, cursor: 'pointer', textAlign: 'left',
        }}
      >
        <span style={{ fontWeight: 600, fontSize: '0.88rem', color: colors.textPrimary }}>
          {t('laundry.upcoming.title')}
          <span style={{ fontWeight: 400, color: colors.textMuted, marginLeft: 8, fontSize: '0.8rem' }}>
            ({myBookings.length})
          </span>
        </span>
        <svg
          aria-hidden="true"
          width="14" height="14" viewBox="0 0 14 14" fill="none"
          style={{ transition: 'transform 0.2s', transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)', flexShrink: 0 }}
        >
          <path d="M2 5l5 5 5-5" stroke={colors.textMuted} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {expanded && myBookings.map(b => {
        const monthIdx = parseInt(b.date.split('-')[1] ?? '1', 10) - 1
        return (
          <div
            key={b.id}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 20px', borderBottom: `1px solid ${colors.borderRow}`, flexWrap: 'wrap', gap: 8,
            }}
          >
            <span style={{ fontSize: '0.88rem', color: colors.textPrimary }}>
              <strong style={{ color: colors.primary, marginRight: 6 }}>
                {dayShortLabel(b.date, today)} {dayNum(b.date)}. {monthShort(monthIdx)}
              </strong>
              {b.roomName} · {formatTimeRange(b.startTime, b.endTime)}
              {b.machineName ? ` · ${b.machineName}` : ''}
            </span>
            {b.canCancel ? (
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                style={{ fontSize: '0.78rem', padding: '0 14px', borderRadius: 20, minHeight: TAP_TARGET_PX }}
                aria-label={t('laundry.actions.cancelSlot', { time: `${formatDateFull(b.date)} ${formatTimeRange(b.startTime, b.endTime)}` })}
                onClick={() => onCancelUpcoming(b)}
              >
                {t('laundry.actions.cancelBooking')}
              </button>
            ) : (
              <span style={{ fontSize: '0.75rem', color: colors.textMuted }}>{t('laundry.slot.cancelDeadlinePassed')}</span>
            )}
          </div>
        )
      })}
    </div>
  )
}

// Suppress unused-import warning — PendingAction is used by the parent
export type { PendingAction }
