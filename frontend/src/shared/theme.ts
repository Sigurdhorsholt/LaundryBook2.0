/**
 * theme.ts — single source of truth for all UI colors.
 *
 * HOW TO SWITCH PALETTE:
 *   1. Comment out the active `const palette = { ... }` block below.
 *   2. Uncomment the palette block you want.
 *   3. Save. Everything propagates automatically.
 *
 * The primary cluster is the only thing that differs between palettes.
 * All other tokens (text, surfaces, borders, semantic) are palette-neutral.
 */

// ── OPTION A — Blue (current default) ─────────────────────────────────────────
// @ts-ignore
const palette_NOTACTIVE1 = {
  primary:          '#1565c0',
  primaryLight:     '#e8f0fe',
  primaryLighter:   '#f0f5ff',
  primaryBorder:    '#c5d9fb',
  primaryMuted:     '#dce8ff',
  primaryMutedText: '#2c4f8c',
  primaryAccent:    '#3d5a8a',
  textPrimary:      '#0d1b2a',   // neutral dark — unchanged for this palette
}

// ── OPTION B — Fresh Teal ──────────────────────────────────────────────────────
// @ts-ignore
 const palette_NOTACTIVE2 = {
   primary:          '#0f7ea6',
   primaryLight:     '#e0f4fa',
   primaryLighter:   '#f0fafd',
   primaryBorder:    '#b3e0ef',
   primaryMuted:     '#d0eef8',
   primaryMutedText: '#0c5f7a',
   primaryAccent:    '#1a6e8a',
   textPrimary:      '#0d1b2a',   // unchanged
 }

// ── OPTION C — Warm Sage ───────────────────────────────────────────────────────
// @ts-ignore
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

  // ── Availability dots ─────────────────────────────────────────────────────────
  dotFree: '#4caf50',
  dotFew:  '#f59e0b',
  dotFull: '#e0e0e0',

  // ── Sidebar ───────────────────────────────────────────────────────────────────
  sidebarText:       '#4a5568',
  sidebarHoverBg:    '#f5f7fa',

  // ── Role badges ───────────────────────────────────────────────────────────────
  roleResident:     { bg: '#f0f4f8',      text: '#5a6a7a'  },
  roleComplexAdmin: { bg: palette.primaryLight, text: palette.primary },
  roleOrgAdmin:     { bg: '#e8f5e9',      text: '#2e7d32'  },
  roleSysAdmin:     { bg: '#fce4ec',      text: '#c62828'  },

} as const

export type ColorToken = keyof typeof colors
