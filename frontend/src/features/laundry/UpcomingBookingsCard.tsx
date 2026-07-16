import { useTranslation } from 'react-i18next'
import type { MyBookingDto } from './laundryApi'
import type { PendingAction } from './types'
import { dayShortLabel, dayNum, formatTimeRange, monthShort } from '../../shared/utils/dateUtils'
import { colors } from '../../shared/theme'

interface Props {
  myBookings: MyBookingDto[]
  today: string
  expanded: boolean
  onToggle: () => void
  onCancelUpcoming: (b: MyBookingDto) => void
}

function DateChip({ date }: { date: string }) {
  const monthIdx = parseInt(date.split('-')[1] ?? '1', 10) - 1
  return (
    <span style={{
      display: 'inline-flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      width: 40, height: 40, borderRadius: 10, flexShrink: 0,
      backgroundColor: colors.primaryLight, color: colors.primary,
    }}>
      <span style={{ fontSize: '0.95rem', fontWeight: 700, lineHeight: 1.1, fontVariantNumeric: 'tabular-nums' }}>{dayNum(date)}</span>
      <span style={{ fontSize: '0.58rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1 }}>{monthShort(monthIdx)}</span>
    </span>
  )
}

export function UpcomingBookingsCard({ myBookings, today, expanded, onToggle, onCancelUpcoming }: Props) {
  const { t } = useTranslation()
  if (myBookings.length === 0) return null

  return (
    <div className="lb-card mb-4" style={{ overflow: 'hidden' }}>
      <button
        onClick={onToggle}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 20px', border: 'none', borderBottom: expanded ? `1px solid ${colors.borderRow}` : 'none',
          backgroundColor: colors.bgHeader, cursor: 'pointer', textAlign: 'left',
        }}
      >
        <span style={{ fontWeight: 600, fontSize: '0.88rem', color: colors.textPrimary, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          {t('laundry.upcoming.title')}
          <span style={{
            fontWeight: 600, fontSize: '0.72rem', padding: '2px 8px', borderRadius: 999,
            backgroundColor: colors.primaryLight, color: colors.primary,
          }}>
            {myBookings.length}
          </span>
        </span>
        <svg
          width="14" height="14" viewBox="0 0 14 14" fill="none"
          style={{ transition: 'transform 0.2s', transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)', flexShrink: 0 }}
        >
          <path d="M2 5l5 5 5-5" stroke={colors.textMuted} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {expanded && myBookings.map(b => (
        <div
          key={b.id}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 20px', borderBottom: `1px solid ${colors.borderRow}`, flexWrap: 'wrap', gap: 10,
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
            <DateChip date={b.date} />
            <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 600, color: colors.textPrimary }}>
                {dayShortLabel(b.date, today)} · {formatTimeRange(b.startTime, b.endTime)}
              </span>
              <span style={{ fontSize: '0.76rem', color: colors.textSecondary }}>
                {b.roomName}{b.machineName ? ` · ${b.machineName}` : ''}
              </span>
            </span>
          </span>
          {b.canCancel ? (
            <button
              className="lb-btn lb-btn-ghost"
              style={{ fontSize: '0.75rem', padding: '6px 14px' }}
              onClick={() => onCancelUpcoming(b)}
            >
              {t('laundry.actions.cancelBooking')}
            </button>
          ) : (
            <span style={{ fontSize: '0.75rem', color: colors.textMuted }}>{t('laundry.slot.cancelDeadlinePassed')}</span>
          )}
        </div>
      ))}
    </div>
  )
}

// Suppress unused-import warning — PendingAction is used by the parent
export type { PendingAction }
