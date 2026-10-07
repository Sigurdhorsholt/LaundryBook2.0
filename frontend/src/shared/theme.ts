// Single source of truth for all UI colors. The primary cluster is the brand (Deep Sage);
// all other tokens (text, surfaces, borders, semantic) are palette-neutral.

const palette = {
  primary:          '#2c6a4d',
  primaryLight:     '#dcebe2',
  primaryLighter:   '#eef5f0',
  primaryBorder:    '#a9cdb8',
  primaryMuted:     '#cfe8da',
  primaryMutedText: '#1e4f38',
  primaryAccent:    '#235a40',
  textPrimary:      '#12201a',   // slightly green-tinted dark for cohesion
}

// ── Stable tokens (palette-neutral) ───────────────────────────────────────────

export const colors = {

  // ── Primary (from active palette) ───────────────────────────────────────────
  ...palette,

  // ── Text ─────────────────────────────────────────────────────────────────────
  // textPrimary comes from palette above (may vary per palette)
  textSecondary: '#3f5048',
  textMuted:     '#5a6b62',
  textDisabled:  '#8a978f',

  // ── Surfaces ──────────────────────────────────────────────────────────────────
  bgPage:   '#e8ece6',
  bgCard:   '#ffffff',
  bgSubtle: '#f3f5f1',
  bgMuted:  '#eef1ec',
  bgHeader: '#f3f5f1',   // card/section header rows

  // ── Borders ───────────────────────────────────────────────────────────────────
  borderDefault: '#cfd8d0',
  borderStrong:  '#aebbb1',
  borderRow:     '#e1e7e2',  // between rows inside cards

  // ── Semantic — success ────────────────────────────────────────────────────────
  successText:   '#22693a',
  successBg:     '#e6f3ea',
  successBorder: '#b9dcc4',

  // ── Semantic — warning ────────────────────────────────────────────────────────
  warningText:   '#8a500c',
  warningBg:     '#fbefd9',
  warningBorder: '#ecd3a4',

  // ── Semantic — danger ─────────────────────────────────────────────────────────
  dangerText:    '#a8261f',
  dangerBg:      '#fbe7e5',
  dangerBorder:  '#f0c3bf',

  // ── Booking grid ──────────────────────────────────────────────────────────────
  slotOwnBg:        '#cfe8da',   // green tint for "my booking" row
  slotOwnText:      '#174a32',
  slotTakenBg:      '#e3e7e2',
  slotTakenText:    '#4b5a52',
  slotFreeBg:       '#e4f1e8',   // soft green for "ledig" availability badges
  slotFreeText:     '#1f5c3f',

  // ── Availability dots ─────────────────────────────────────────────────────────
  dotFree: '#2f8a5a',
  dotFew:  '#c27c12',
  dotFull: '#aebbb1',

  // ── Footer ────────────────────────────────────────────────────────────────────
  footerBg: '#0a1929',

  // ── Booking grid — warning overrides ──────────────────────────────────────────
  // maxReached banner uses a slightly warmer amber than the standard warning tokens
  slotWarningBg:     '#fbefd9',
  slotWarningText:   '#6e3f06',
  slotWarningBorder: '#ecd3a4',

  // Pending (unsaved) slot colour in the day timeline
  slotPendingColor: '#64b5f6',

  // ── Sidebar ───────────────────────────────────────────────────────────────────
  sidebarText:       '#3f5048',
  sidebarHoverBg:    '#eef1ec',

  // ── Role badges ───────────────────────────────────────────────────────────────
  roleResident:     { bg: '#eef1ec',      text: '#3f5048'  },
  roleComplexAdmin: { bg: palette.primaryLight, text: palette.primaryMutedText },
  roleOrgAdmin:     { bg: '#e4f1e8',      text: '#1f5c3f'  },
  roleSysAdmin:     { bg: '#fbe7e5',      text: '#a8261f'  },

} as const

