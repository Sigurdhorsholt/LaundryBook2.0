import { colors } from '../../shared/theme'

// ── Booking grid ───────────────────────────────────────────────────────────────

export const DOT_COLOR: Record<string, string> = {
  free: colors.dotFree,
  few:  colors.dotFew,
  full: colors.dotFull,
  past: 'transparent',
}

// ── Slot generator ─────────────────────────────────────────────────────────────

export const DURATION_OPTIONS = [
  { label: '30m',  minutes: 30  },
  { label: '1t',   minutes: 60  },
  { label: '1t30', minutes: 90  },
  { label: '2t',   minutes: 120 },
  { label: '2t30', minutes: 150 },
  { label: '3t',   minutes: 180 },
]

export const TEMPLATES = [
  { label: 'Standard', sublabel: '07–22 · 1t30', from: '07:00', to: '22:00', durationMinutes: 90  },
  { label: 'Kompakt',  sublabel: '07–22 · 1t',   from: '07:00', to: '22:00', durationMinutes: 60  },
  { label: 'Halvdag',  sublabel: '07–13 · 2t',   from: '07:00', to: '13:00', durationMinutes: 120 },
]

// ── Day timeline ───────────────────────────────────────────────────────────────

export const TIMELINE_START = 6 * 60
export const TIMELINE_END   = 23 * 60
export const TIMELINE_TOTAL = TIMELINE_END - TIMELINE_START
export const TIMELINE_TICKS = ['06:00', '12:00', '18:00', '23:00']
