import { colors } from '../../shared/theme'
import type { TodayBooking } from './types'

export const OVERVIEW_CARD: React.CSSProperties = {
  backgroundColor: colors.bgCard,
  border: `1px solid ${colors.borderDefault}`,
  borderRadius: 14,
  padding: '16px 18px',
}

export const TODAY_STATUS_STYLE = {
  done:  { labelKey: 'adminOverview.today.done',  bg: colors.bgSubtle,     color: colors.textMuted },
  now:   { labelKey: 'adminOverview.today.now',   bg: colors.primaryLight, color: colors.primaryMutedText },
  later: { labelKey: 'adminOverview.today.later', bg: colors.slotTakenBg,  color: colors.slotTakenText },
} as const satisfies Record<TodayBooking['status'], { labelKey: string; bg: string; color: string }>
