import { colors } from '../../shared/theme'
import { MachineType } from './laundryApi'

// ── Booking grid ───────────────────────────────────────────────────────────────

export const DOT_COLOR: Record<string, string> = {
  free: colors.dotFree,
  few:  colors.dotFew,
  full: colors.dotFull,
  past: 'transparent',
}

export const MACHINE_TYPE_LABEL = {
  [MachineType.Washer]:      'laundry.machineType.washer',
  [MachineType.Dryer]:       'laundry.machineType.dryer',
  [MachineType.WasherDryer]: 'laundry.machineType.washerDryer',
} as const satisfies Record<MachineType, string>

// ── Slot generator ─────────────────────────────────────────────────────────────

// Minutes; shown through durationLabel() so the "1t30" / "1h30" shorthand follows the language
export const DURATION_OPTIONS = [30, 60, 90, 120, 150, 180]

export const TEMPLATES = [
  { labelKey: 'laundry.template.standard', from: '07:00', to: '22:00', durationMinutes: 90  },
  { labelKey: 'laundry.template.compact',  from: '07:00', to: '22:00', durationMinutes: 60  },
  { labelKey: 'laundry.template.halfDay',  from: '07:00', to: '13:00', durationMinutes: 120 },
]

// ── Day timeline ───────────────────────────────────────────────────────────────

export const TIMELINE_START = 6 * 60
export const TIMELINE_END   = 23 * 60
export const TIMELINE_TOTAL = TIMELINE_END - TIMELINE_START
export const TIMELINE_TICKS = ['06:00', '12:00', '18:00', '23:00']

// Minimum touch target for grid actions; most residents book from a phone
export const TAP_TARGET_PX = 44

// ── Booking side panel ─────────────────────────────────────────────────────────

export const SIDE_CARD: React.CSSProperties = {
  backgroundColor: colors.bgCard,
  border: `1px solid ${colors.borderDefault}`,
  borderRadius: 14,
  padding: '18px 20px',
}
