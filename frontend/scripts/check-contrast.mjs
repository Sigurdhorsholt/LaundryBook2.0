// Fails when a text/background token pair in theme.ts drops below WCAG AA.
// Run: npm run check:contrast (Node 23.6+ loads theme.ts directly).
import { colors } from '../src/shared/theme.ts'

const TEXT = 4.5
const UI = 3

const pairs = [
  ['textPrimary', 'bgCard', TEXT],
  ['textPrimary', 'bgPage', TEXT],
  ['textSecondary', 'bgCard', TEXT],
  ['textSecondary', 'bgPage', TEXT],
  ['textSecondary', 'bgSubtle', TEXT],
  ['textSecondary', 'slotTakenBg', TEXT],
  ['textMuted', 'bgCard', TEXT],
  ['textMuted', 'bgPage', TEXT],
  ['textMuted', 'bgSubtle', TEXT],
  ['textMuted', 'bgHeader', TEXT],
  ['textMuted', 'bgMuted', TEXT],
  ['primary', 'bgCard', TEXT],
  ['primary', 'bgPage', TEXT],
  ['primary', 'primaryLight', TEXT],
  ['primary', 'primaryLighter', TEXT],
  ['bgCard', 'primary', TEXT],
  ['bgCard', 'primaryAccent', TEXT],
  ['primaryMutedText', 'primaryMuted', TEXT],
  ['primaryMutedText', 'primaryLight', TEXT],
  ['successText', 'successBg', TEXT],
  ['successText', 'bgCard', TEXT],
  ['warningText', 'warningBg', TEXT],
  ['warningText', 'bgCard', TEXT],
  ['primary', 'warningBg', TEXT],
  ['dangerText', 'dangerBg', TEXT],
  ['dangerText', 'bgCard', TEXT],
  ['bgCard', 'dangerText', TEXT],
  ['slotOwnText', 'slotOwnBg', TEXT],
  ['slotTakenText', 'slotTakenBg', TEXT],
  ['slotTakenText', 'bgCard', TEXT],
  ['slotFreeText', 'slotFreeBg', TEXT],
  ['slotWarningText', 'slotWarningBg', TEXT],
  ['sidebarText', 'bgCard', TEXT],
  ['sidebarText', 'sidebarHoverBg', TEXT],
  ['chromeText', 'chrome', TEXT],
  ['chromeMuted', 'chrome', TEXT],
  ['chromeAccent', 'chrome', TEXT],
  ['chromeText', 'chromeRaised', TEXT],
  ['bgCard', 'chrome', TEXT],
  ['dotFree', 'bgCard', UI],
  ['dotFew', 'bgCard', UI],
]

const roles = ['roleResident', 'roleComplexAdmin', 'roleOrgAdmin', 'roleSysAdmin']

function luminance(hex) {
  const n = parseInt(hex.slice(1), 16)
  const channel = (c) => {
    const v = c / 255
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * channel(n >> 16) + 0.7152 * channel((n >> 8) & 0xff) + 0.0722 * channel(n & 0xff)
}

function ratio(fg, bg) {
  const [a, b] = [luminance(fg), luminance(bg)].sort((x, y) => y - x)
  return (a + 0.05) / (b + 0.05)
}

const rows = [
  ...pairs.map(([fg, bg, min]) => ({ name: `${fg} on ${bg}`, fg: colors[fg], bg: colors[bg], min })),
  ...roles.map((r) => ({ name: `${r}.text on ${r}.bg`, fg: colors[r].text, bg: colors[r].bg, min: TEXT })),
]

let failed = 0
for (const row of rows) {
  const r = ratio(row.fg, row.bg)
  const ok = r >= row.min
  if (!ok) failed++
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${r.toFixed(2).padStart(5)}:1  (min ${row.min})  ${row.name}`)
}

if (failed > 0) {
  console.error(`\n${failed} pair(s) below WCAG AA`)
  process.exit(1)
}
