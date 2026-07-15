import { useState, useMemo } from 'react'
import { useTranslation, Trans } from 'react-i18next'
import type { TFunction } from 'i18next'
import { BookingGrid, type GridBooking } from '../../features/laundry/BookingGrid'
import type { TimeSlotTemplateDto } from '../../features/laundry/laundryApi'
import { BookingMode } from '../../features/properties/propertiesApi'
import { colors } from '../../shared/theme'
import { IconChevronLeft, IconChevronRight } from '../../shared/icons'

// ── Mock data ──────────────────────────────────────────────────────────────────

const SLOTS: TimeSlotTemplateDto[] = [
  { id: 's1', startTime: '07:00:00', endTime: '08:30:00', isActive: true },
  { id: 's2', startTime: '08:30:00', endTime: '10:00:00', isActive: true },
  { id: 's3', startTime: '10:00:00', endTime: '11:30:00', isActive: true },
  { id: 's4', startTime: '11:30:00', endTime: '13:00:00', isActive: true },
  { id: 's5', startTime: '13:00:00', endTime: '14:30:00', isActive: true },
  { id: 's6', startTime: '14:30:00', endTime: '16:00:00', isActive: true },
  { id: 's7', startTime: '16:00:00', endTime: '17:30:00', isActive: true },
  { id: 's8', startTime: '17:30:00', endTime: '19:00:00', isActive: true },
]

const MAX_CONCURRENT = 2
const LOOKAHEAD_DAYS = 14

const DOT_COLOR: Record<string, string> = {
  free: colors.dotFree, few: colors.dotFew, full: colors.dotFull, past: 'transparent',
}

const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const
const MONTH_KEYS = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'] as const

// ── Helpers ────────────────────────────────────────────────────────────────────

function getTodayStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function addDays(dateStr: string, n: number): string {
  const parts = dateStr.split('-').map(Number)
  const d = new Date(parts[0] ?? 2025, (parts[1] ?? 1) - 1, (parts[2] ?? 1) + n)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getWeekMonday(dateStr: string): string {
  const parts = dateStr.split('-').map(Number)
  const d = new Date(parts[0] ?? 2025, (parts[1] ?? 1) - 1, parts[2] ?? 1)
  const dow = d.getDay()
  return addDays(dateStr, dow === 0 ? -6 : 1 - dow)
}

function smartDayShort(dateStr: string, today: string, t: TFunction): string {
  if (dateStr === today) return t('public.residentDemo.today')
  if (dateStr === addDays(today, 1)) return t('public.residentDemo.tomorrow')
  const parts = dateStr.split('-').map(Number)
  const d = new Date(parts[0] ?? 2025, (parts[1] ?? 1) - 1, parts[2] ?? 1)
  return t(`public.residentDemo.daysShort.${DAY_KEYS[d.getDay()] ?? 'mon'}`)
}

function dateParts(dateStr: string, t: TFunction): { dayNum: number; fullLabel: string } {
  const parts = dateStr.split('-').map(Number)
  const d = new Date(parts[0] ?? 2025, (parts[1] ?? 1) - 1, parts[2] ?? 1)
  const dayLong = t(`public.residentDemo.daysLong.${DAY_KEYS[d.getDay()] ?? 'mon'}`)
  const monthShort = t(`public.residentDemo.monthsShort.${MONTH_KEYS[d.getMonth()] ?? 'jan'}`)
  return {
    dayNum: d.getDate(),
    fullLabel: `${dayLong} ${d.getDate()}. ${monthShort}`,
  }
}

// Pre-seeded bookings by "other residents". Key = `${slotId}_${date}`.
function makeSeedBookings(today: string): Set<string> {
  return new Set([
    `s4_${today}`, `s7_${today}`,
    `s3_${addDays(today, 1)}`,
    `s1_${addDays(today, 2)}`, `s2_${addDays(today, 2)}`, `s5_${addDays(today, 2)}`,
    `s1_${addDays(today, 3)}`, `s2_${addDays(today, 3)}`, `s3_${addDays(today, 3)}`,
    `s4_${addDays(today, 3)}`, `s5_${addDays(today, 3)}`, `s6_${addDays(today, 3)}`,
    `s7_${addDays(today, 3)}`, `s8_${addDays(today, 3)}`,
  ])
}

// ── Component ──────────────────────────────────────────────────────────────────

export function ResidentDemoBooking() {
  const { t } = useTranslation()
  const today        = useMemo(() => getTodayStr(), [])
  const thisWeekMon  = useMemo(() => getWeekMonday(today), [today])
  const lookaheadEnd = useMemo(() => addDays(today, LOOKAHEAD_DAYS), [today])

  const [ownBookings,  setOwnBookings]  = useState<Set<string>>(new Set())
  const [otherBookings]                 = useState<Set<string>>(() => makeSeedBookings(today))
  const [selectedDate, setSelectedDate] = useState(today)
  const [weekStart,    setWeekStart]    = useState(thisWeekMon)
  // date is stored on pending so cancel-from-next-card uses the correct date, not selectedDate
  const [pending, setPending] = useState<{ type: 'book' | 'cancel'; slotId: string; date: string } | null>(null)

  const visibleDates = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart])
  const canGoBack    = weekStart > thisWeekMon

  const maxReached = useMemo(() => {
    let count = 0
    for (const key of ownBookings) {
      const date = key.split('_')[1] ?? ''
      if (date >= today) count++
    }
    return count >= MAX_CONCURRENT
  }, [ownBookings, today])

  const gridBookings = useMemo((): GridBooking[] =>
    SLOTS.flatMap((slot): GridBooking[] => {
      const key = `${slot.id}_${selectedDate}`
      if (ownBookings.has(key))   return [{ bookingId: key, slotId: slot.id, isOwn: true,  label: t('public.residentDemo.myBooking'), canCancel: true,  machineId: null, machineName: null }]
      if (otherBookings.has(key)) return [{ bookingId: key, slotId: slot.id, isOwn: false, label: t('public.residentDemo.busy'),      canCancel: false, machineId: null, machineName: null }]
      return []
    })
  , [ownBookings, otherBookings, selectedDate, t])

  const availabilityByDate = useMemo(() => {
    const result: Record<string, 'free' | 'few' | 'full' | 'past'> = {}
    for (const date of visibleDates) {
      if (date < today || date > lookaheadEnd) { result[date] = 'past'; continue }
      const booked = SLOTS.filter(s =>
        ownBookings.has(`${s.id}_${date}`) || otherBookings.has(`${s.id}_${date}`)
      ).length
      const free = SLOTS.length - booked
      result[date] = free === 0 ? 'full' : free <= 2 ? 'few' : 'free'
    }
    return result
  }, [visibleDates, ownBookings, otherBookings, today, lookaheadEnd])

  // Find the earliest upcoming own booking in slot-time order
  const nextOwn = useMemo(() => {
    for (let i = 0; i <= LOOKAHEAD_DAYS; i++) {
      const date = addDays(today, i)
      const slot = SLOTS.find(s => ownBookings.has(`${s.id}_${date}`))
      if (slot) return { date, slot }
    }
    return null
  }, [ownBookings, today])

  function shiftWeek(n: number) {
    const next = addDays(weekStart, n)
    if (next < thisWeekMon) return
    setWeekStart(next)
    setSelectedDate(prev => {
      const newEnd = addDays(next, 6)
      return prev >= next && prev <= newEnd ? prev : next
    })
  }

  function handleConfirm() {
    if (!pending) return
    const { type, slotId, date } = pending
    const key = `${slotId}_${date}`
    setPending(null)
    if (type === 'book') {
      setOwnBookings(prev => new Set([...prev, key]))
    } else {
      setOwnBookings(prev => { const s = new Set(prev); s.delete(key); return s })
    }
  }

  const pendingSlot = pending ? SLOTS.find(s => s.id === pending.slotId) : null

  return (
    <div className="p-3 p-md-4">
      <div className="mb-4">
        <h1 className="fw-bold mb-1" style={{ fontSize: '1.5rem', color: colors.textPrimary }}>{t('nav.laundry')}</h1>
        <p className="mb-0" style={{ fontSize: '0.85rem', color: colors.textSecondary }}>{t('public.residentDemo.subtitle')}</p>
      </div>

      {/* Next booking card */}
      {nextOwn && (
        <div className="rounded-3 mb-4 p-3 d-flex align-items-center justify-content-between gap-3"
          style={{ backgroundColor: colors.successBg, border: `1px solid ${colors.successBorder}` }}>
          <div>
            <p style={{ fontSize: '0.7rem', fontWeight: 700, color: colors.successText, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>
              {t('public.residentDemo.nextBooking')}
            </p>
            <p style={{ fontSize: '0.9rem', fontWeight: 600, color: colors.textPrimary, marginBottom: 0 }}>
              {dateParts(nextOwn.date, t).fullLabel} · {nextOwn.slot.startTime.slice(0, 5)} – {nextOwn.slot.endTime.slice(0, 5)}
            </p>
          </div>
          <button
            className="btn btn-sm btn-outline-danger flex-shrink-0"
            style={{ borderRadius: 7, fontSize: '0.78rem' }}
            onClick={() => setPending({ type: 'cancel', slotId: nextOwn.slot.id, date: nextOwn.date })}
          >
            {t('public.residentDemo.cancelBooking')}
          </button>
        </div>
      )}

      {/* Date strip with week navigation */}
      <div className="d-flex align-items-center gap-1 mb-3 p-2 rounded-3"
        style={{ backgroundColor: colors.bgPage, border: `1px solid ${colors.borderDefault}` }}>
        <button
          className="btn btn-sm p-1 flex-shrink-0"
          style={{ color: canGoBack ? colors.textPrimary : colors.textDisabled, lineHeight: 1 }}
          disabled={!canGoBack}
          onClick={() => shiftWeek(-7)}
          aria-label={t('public.residentDemo.prevWeek')}
        >
          <IconChevronLeft size={15} />
        </button>

        <div className="d-flex flex-grow-1 justify-content-between" style={{ gap: 2, overflowX: 'auto' }}>
          {visibleDates.map(date => {
            const { dayNum } = dateParts(date, t)
            const isSelected = date === selectedDate
            const isDimmed   = date < today || date > lookaheadEnd
            const dotState   = availabilityByDate[date] ?? 'free'
            return (
              <button
                key={date}
                className="btn d-flex flex-column align-items-center flex-shrink-0"
                style={{
                  borderRadius: 8, padding: '4px 6px', minWidth: 36, lineHeight: 1.25,
                  fontWeight: isSelected ? 700 : 400,
                  backgroundColor: isSelected ? colors.primary : 'transparent',
                  color: isSelected ? '#ffffff' : isDimmed ? colors.textDisabled : colors.textPrimary,
                  border: 'none', fontSize: '0.72rem', cursor: 'pointer',
                }}
                onClick={() => setSelectedDate(date)}
              >
                <span style={{ textTransform: 'capitalize' }}>{smartDayShort(date, today, t)}</span>
                <span style={{ fontSize: '0.88rem', fontWeight: isSelected ? 700 : 500 }}>{dayNum}</span>
                <span style={{
                  width: 5, height: 5, borderRadius: '50%', display: 'block', marginTop: 1,
                  backgroundColor: isSelected ? 'rgba(255,255,255,0.45)' : (DOT_COLOR[dotState] ?? 'transparent'),
                }} />
              </button>
            )
          })}
        </div>

        <button
          className="btn btn-sm p-1 flex-shrink-0"
          style={{ color: colors.textPrimary, lineHeight: 1 }}
          onClick={() => shiftWeek(7)}
          aria-label={t('public.residentDemo.nextWeek')}
        >
          <IconChevronRight size={15} />
        </button>
      </div>

      {/* Booking grid */}
      <div className="rounded-3 overflow-hidden" style={{ border: `1px solid ${colors.borderDefault}` }}>
        <BookingGrid
          slots={SLOTS}
          date={selectedDate}
          today={today}
          bookingLookaheadDays={LOOKAHEAD_DAYS}
          gridBookings={gridBookings}
          maxReached={maxReached}
          bookingMode={BookingMode.BookEntireRoom}
          machines={[]}
          onBook={(slotId)   => setPending({ type: 'book',   slotId, date: selectedDate })}
          onCancel={(slotId) => setPending({ type: 'cancel', slotId, date: selectedDate })}
        />
      </div>

      {/* Confirmation modal */}
      {pending && pendingSlot && (
        <DemoConfirmModal
          type={pending.type}
          slotTime={`${pendingSlot.startTime.slice(0, 5)} – ${pendingSlot.endTime.slice(0, 5)}`}
          dateLabel={dateParts(pending.date, t).fullLabel}
          onConfirm={handleConfirm}
          onClose={() => setPending(null)}
        />
      )}
    </div>
  )
}

// ── Confirmation modal ─────────────────────────────────────────────────────────

function DemoConfirmModal({
  type, slotTime, dateLabel, onConfirm, onClose,
}: {
  type: 'book' | 'cancel'
  slotTime: string
  dateLabel: string
  onConfirm: () => void
  onClose: () => void
}) {
  const { t } = useTranslation()
  return (
    <>
      <div
        style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.35)', zIndex: 1050 }}
        onClick={onClose}
      />
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: colors.bgCard, borderRadius: 12, padding: '24px',
        width: 300, maxWidth: 'calc(100vw - 32px)',
        zIndex: 1051, boxShadow: '0 8px 40px rgba(0,0,0,0.15)',
      }}>
        <h6 style={{ fontWeight: 700, color: colors.textPrimary, marginBottom: 6, fontSize: '1rem' }}>
          {type === 'book' ? t('public.residentDemo.modal.confirmBookTitle') : t('public.residentDemo.modal.confirmCancelTitle')}
        </h6>
        <p style={{ fontSize: '0.88rem', color: colors.textSecondary, marginBottom: 6, lineHeight: 1.5 }}>
          {type === 'book'
            ? <Trans i18nKey="public.residentDemo.modal.bookBody" values={{ slotTime, dateLabel }} components={{ s: <strong /> }} />
            : <Trans i18nKey="public.residentDemo.modal.cancelBody" values={{ slotTime, dateLabel }} components={{ s: <strong /> }} />
          }
        </p>
        <p style={{ fontSize: '0.76rem', color: colors.textMuted, marginBottom: 20 }}>
          {t('public.residentDemo.modal.demoNote')}
        </p>
        <div className="d-flex gap-2 justify-content-end">
          <button
            className="btn btn-sm btn-outline-secondary"
            style={{ borderRadius: 7, fontSize: '0.82rem' }}
            onClick={onClose}
          >
            {t('common.cancel')}
          </button>
          <button
            className={`btn btn-sm ${type === 'book' ? 'btn-primary' : 'btn-danger'}`}
            style={{ borderRadius: 7, fontSize: '0.82rem' }}
            onClick={onConfirm}
          >
            {type === 'book' ? t('public.residentDemo.book') : t('public.residentDemo.cancelBooking')}
          </button>
        </div>
      </div>
    </>
  )
}
