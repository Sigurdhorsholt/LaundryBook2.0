import i18n from '../../i18n'

// ── Date string helpers ────────────────────────────────────────────────────────

export function todayStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function addDays(dateStr: string, n: number): string {
  const parts = dateStr.split('-').map(Number)
  const d = new Date(parts[0] ?? 2025, (parts[1] ?? 1) - 1, (parts[2] ?? 1) + n)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function getWeekMonday(dateStr: string): string {
  const parts = dateStr.split('-').map(Number)
  const d = new Date(parts[0] ?? 2025, (parts[1] ?? 1) - 1, parts[2] ?? 1)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function dayNum(dateStr: string): number {
  return parseInt(dateStr.slice(8), 10)
}

// ── Time string helpers ────────────────────────────────────────────────────────

/** "HH:mm:ss" or "HH:mm:ss.xxx" → "HH:mm" */
export function formatTime(time: string): string {
  return time.slice(0, 5)
}

/** "HH:mm" → total minutes */
export function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return (h ?? 0) * 60 + (m ?? 0)
}

/** total minutes → "HH:mm:ss" */
export function toHHmmss(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`
}

/** total minutes → "HH:mm" */
export function toHHmm(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/** "HH:mm:ss" start + "HH:mm:ss" end → "HH:mm–HH:mm" */
export function formatTimeRange(start: string, end: string): string {
  return `${start.slice(0, 5)}–${end.slice(0, 5)}`
}

// ── Display label helpers (locale-aware) ───────────────────────────────────────
// Monday-first arrays (index 0 = Monday).

const DAY_SHORT: Record<string, string[]> = {
  da: ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'],
  en: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
}
const DAY_FULL: Record<string, string[]> = {
  da: ['Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag', 'Søndag'],
  en: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
}
const MONTH_SHORT: Record<string, string[]> = {
  da: ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
}

function activeLang(): 'da' | 'en' {
  return i18n.language === 'en' ? 'en' : 'da'
}

/** Localized short month name for a 0-based month index. */
export function monthShort(monthIndex: number): string {
  return MONTH_SHORT[activeLang()]?.[monthIndex] ?? ''
}

/** "I dag"/"Today" · "I morgen"/"Tomorrow" · else short day abbreviation */
export function dayShortLabel(dateStr: string, today: string): string {
  if (dateStr === today)             return i18n.t('dates.today')
  if (dateStr === addDays(today, 1)) return i18n.t('dates.tomorrow')
  const parts = dateStr.split('-').map(Number)
  const d = new Date(parts[0] ?? 2025, (parts[1] ?? 1) - 1, parts[2] ?? 1)
  const dow = d.getDay()
  return DAY_SHORT[activeLang()]?.[dow === 0 ? 6 : dow - 1] ?? ''
}

/** "Onsdag 2. apr" / "Wednesday 2 Apr" */
export function formatDateFull(dateStr: string): string {
  const parts = dateStr.split('-').map(Number)
  const d = new Date(parts[0] ?? 2025, (parts[1] ?? 1) - 1, parts[2] ?? 1)
  const dow = d.getDay()
  const lang = activeLang()
  const dayName = DAY_FULL[lang]?.[dow === 0 ? 6 : dow - 1] ?? ''
  const sep = lang === 'en' ? '' : '.'
  return `${dayName} ${d.getDate()}${sep} ${MONTH_SHORT[lang]?.[d.getMonth()] ?? ''}`
}

/** "Uge 22" / "Week 22" */
export function weekLabel(weekStart: string): string {
  const parts = weekStart.split('-').map(Number)
  const d = new Date(parts[0] ?? 2025, (parts[1] ?? 1) - 1, parts[2] ?? 1)
  const jan4 = new Date(d.getFullYear(), 0, 4)
  const diff = (d.getTime() - jan4.getTime()) / 86400000
  const weekNum = Math.ceil((diff + jan4.getDay() + 1) / 7)
  return i18n.t('dates.week', { n: weekNum })
}

/** Minutes remaining until a slot starts (negative = already past) */
export function minutesUntilSlot(date: string, startTime: string): number {
  const parts = startTime.split(':').map(Number)
  const d = new Date(
    parseInt(date.slice(0, 4)),
    parseInt(date.slice(5, 7)) - 1,
    parseInt(date.slice(8, 10)),
    parts[0] ?? 0, parts[1] ?? 0, 0, 0,
  )
  return Math.floor((d.getTime() - Date.now()) / 60_000)
}

// ── Slot state helpers ─────────────────────────────────────────────────────────

export function isPast(date: string, startTime: string, today: string): boolean {
  if (date < today) return true
  if (date === today) {
    const parts = startTime.split(':').map(Number)
    const slotStart = new Date()
    slotStart.setHours(parts[0] ?? 0, parts[1] ?? 0, 0, 0)
    return slotStart <= new Date()
  }
  return false
}

export function isLocked(date: string, today: string, lookaheadDays: number): boolean {
  return date > addDays(today, lookaheadDays)
}
