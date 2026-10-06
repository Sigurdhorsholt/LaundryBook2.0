// Single source of truth for all UI colors. The primary cluster is the brand (Warm Sage);
// all other tokens (text, surfaces, borders, semantic) are palette-neutral.

const palette = {
  primary:          '#3d7a5c',
  primaryLight:     '#e8f5ee',
  primaryLighter:   '#f2faf5',
  primaryBorder:    '#b8ddc9',
  primaryMuted:     '#d0ecdb',
  primaryMutedText: '#2a5c42',
  primaryAccent:    '#336650',
  textPrimary:      '#1a2e24',   // slightly green-tinted dark for cohesion
}

// ── Stable tokens (palette-neutral) ───────────────────────────────────────────

export const colors = {

  // ── Primary (from active palette) ───────────────────────────────────────────
  ...palette,

  // ── Text ─────────────────────────────────────────────────────────────────────
  // textPrimary comes from palette above (may vary per palette)
  textSecondary: '#5a6a7a',
  textMuted:     '#a0adb8',
  textDisabled:  '#c0ccd8',

  // ── Surfaces ──────────────────────────────────────────────────────────────────
  bgPage:   '#f8fafb',
  bgCard:   '#ffffff',
  bgSubtle: '#f0f4f8',
  bgMuted:  '#f4f6f8',
  bgHeader: '#f8fafc',   // card/section header rows

  // ── Borders ───────────────────────────────────────────────────────────────────
  borderDefault: '#e8ecf0',
  borderStrong:  '#d0d8e0',
  borderRow:     '#f0f4f8',  // between rows inside cards

  // ── Semantic — success ────────────────────────────────────────────────────────
  successText:   '#2e7d32',
  successBg:     '#f0fdf4',
  successBorder: '#c8e6c9',

  // ── Semantic — warning ────────────────────────────────────────────────────────
  warningText:   '#b45309',
  warningBg:     '#fff8e1',
  warningBorder: '#ffe0b2',

  // ── Semantic — danger ─────────────────────────────────────────────────────────
  dangerText:    '#c62828',
  dangerBg:      '#fce4ec',
  dangerBorder:  '#f8bbd0',

  // ── Booking grid ──────────────────────────────────────────────────────────────
  slotOwnBg:        '#f0fdf4',   // green tint for "my booking" row
  slotOwnText:      '#2e7d32',
  slotTakenBg:      '#f2f4f7',
  slotTakenText:    '#8a9aaa',
  slotFreeBg:       '#eafaf0',   // soft green for "ledig" availability badges
  slotFreeText:     '#2e7d32',

  // ── Availability dots ─────────────────────────────────────────────────────────
  dotFree: '#4caf50',
  dotFew:  '#f59e0b',
  dotFull: '#e0e0e0',

  // ── Footer ────────────────────────────────────────────────────────────────────
  footerBg: '#0a1929',

  // ── Booking grid — warning overrides ──────────────────────────────────────────
  // maxReached banner uses a slightly warmer amber than the standard warning tokens
  slotWarningBg:     '#fff3e0',
  slotWarningText:   '#7a3f00',
  slotWarningBorder: '#f0e0b0',

  // Pending (unsaved) slot colour in the day timeline
  slotPendingColor: '#64b5f6',

  // ── Sidebar ───────────────────────────────────────────────────────────────────
  sidebarText:       '#4a5568',
  sidebarHoverBg:    '#f5f7fa',

  // ── Role badges ───────────────────────────────────────────────────────────────
  roleResident:     { bg: '#f0f4f8',      text: '#5a6a7a'  },
  roleComplexAdmin: { bg: palette.primaryLight, text: palette.primary },
  roleOrgAdmin:     { bg: '#e8f5e9',      text: '#2e7d32'  },
  roleSysAdmin:     { bg: '#fce4ec',      text: '#c62828'  },

} as const

