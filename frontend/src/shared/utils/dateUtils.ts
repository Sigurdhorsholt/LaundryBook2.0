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

// ── Display label helpers (Danish) ────────────────────────────────────────────

const DAY_SHORT   = ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn']
const MONTH_SHORT = ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec']
const DAY_FULL    = ['Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag', 'Søndag']

export { MONTH_SHORT, DAY_SHORT }

/** "I dag" / "I morgen" / short day abbreviation */
export function dayShortLabel(dateStr: string, today: string): string {
  if (dateStr === today)             return 'I dag'
  if (dateStr === addDays(today, 1)) return 'I morgen'
  const parts = dateStr.split('-').map(Number)
  const d = new Date(parts[0] ?? 2025, (parts[1] ?? 1) - 1, parts[2] ?? 1)
  const dow = d.getDay()
  return DAY_SHORT[dow === 0 ? 6 : dow - 1] ?? ''
}

/** "Onsdag 2. apr" */
export function formatDateFull(dateStr: string): string {
  const parts = dateStr.split('-').map(Number)
  const d = new Date(parts[0] ?? 2025, (parts[1] ?? 1) - 1, parts[2] ?? 1)
  const dow = d.getDay()
  return `${DAY_FULL[dow === 0 ? 6 : dow - 1] ?? ''} ${d.getDate()}. ${MONTH_SHORT[d.getMonth()] ?? ''}`
}

/** "Uge 22" */
export function weekLabel(weekStart: string): string {
  const parts = weekStart.split('-').map(Number)
  const d = new Date(parts[0] ?? 2025, (parts[1] ?? 1) - 1, parts[2] ?? 1)
  const jan4 = new Date(d.getFullYear(), 0, 4)
  const diff = (d.getTime() - jan4.getTime()) / 86400000
  return `Uge ${Math.ceil((diff + jan4.getDay() + 1) / 7)}`
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
