import { useTranslation } from 'react-i18next'
import type { BookingDto, LaundryMachineDto, TimeSlotTemplateDto } from './laundryApi'
import { weekCell, type WeekCellContext } from './utils'
import { WeekGridCell } from './WeekGridCell'
import { dayShortLabel, formatDayMonth, formatDateFull, formatTimeRange, isLocked } from '../../shared/utils/dateUtils'
import { colors } from '../../shared/theme'

interface Props {
  weekDays: string[]
  slots: TimeSlotTemplateDto[]
  context: WeekCellContext
  freeCountByDate: Record<string, number>
  maxReached: boolean
  onBook: (slotId: string, date: string, freeMachines: LaundryMachineDto[]) => void
  onCancel: (booking: BookingDto) => void
}

const cellPad: React.CSSProperties = { padding: 5, borderTop: `1px solid ${colors.borderRow}`, verticalAlign: 'middle' }

export function WeekGrid({ weekDays, slots, context, freeCountByDate, maxReached, onBook, onCancel }: Props) {
  const { t } = useTranslation()
  const { today, lookaheadDays, machineMode, machines } = context

  function dayStatus(date: string): string {
    if (date < today) return t('laundry.slot.past')
    if (isLocked(date, today, lookaheadDays)) return t('laundry.week.notOpen')
    const free = freeCountByDate[date] ?? 0
    return free > 0 ? t('laundry.week.freeCount', { count: free }) : t('laundry.slot.fullyBooked')
  }

  return (
    <div style={{ overflowX: 'auto', overflowY: 'hidden' }}>
      <table style={{ width: '100%', minWidth: 760, borderCollapse: 'collapse', tableLayout: 'fixed' }}>
        <caption className="visually-hidden">{t('laundry.week.caption')}</caption>
        <thead>
          <tr>
            <th scope="col" style={{ width: 104, padding: '10px 14px', backgroundColor: colors.bgHeader, fontSize: '0.72rem', fontWeight: 700, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {t('laundry.week.time')}
            </th>
            {weekDays.map(d => {
              const isToday = d === today
              return (
                <th
                  key={d}
                  scope="col"
                  aria-current={isToday ? 'date' : undefined}
                  style={{
                    padding: '8px 4px', textAlign: 'center', fontWeight: 400,
                    backgroundColor: isToday ? colors.primaryLight : colors.bgHeader,
                    borderBottom: `2px solid ${isToday ? colors.primary : 'transparent'}`,
                  }}
                >
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: isToday ? colors.primaryMutedText : colors.textMuted }}>
                    {dayShortLabel(d, today)}
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: colors.textPrimary }}>{formatDayMonth(d)}</div>
                  <div style={{ fontSize: '0.72rem', color: isToday ? colors.primaryMutedText : colors.textMuted }}>{dayStatus(d)}</div>
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {slots.map(slot => {
            const time = formatTimeRange(slot.startTime, slot.endTime)
            return (
              <tr key={slot.id}>
                <th scope="row" style={{ ...cellPad, padding: '5px 14px', fontSize: '0.85rem', fontWeight: 600, color: colors.textPrimary, whiteSpace: 'nowrap' }}>
                  {time}
                </th>
                {weekDays.map(d => (
                  <td key={d} style={cellPad}>
                    <WeekGridCell
                      cell={weekCell(slot, d, context)}
                      slotLabel={`${formatDateFull(d)} ${time}`}
                      totalMachines={machineMode ? machines.length : 0}
                      maxReached={maxReached}
                      onBook={(free) => onBook(slot.id, d, free)}
                      onCancel={onCancel}
                    />
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
