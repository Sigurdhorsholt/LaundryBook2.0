import { useState } from 'react'
import { dayShortLabel, dayNum } from '../../shared/utils/dateUtils'
import { DOT_COLOR } from './constants'
import type { AvailabilityState } from './types'
import { colors } from '../../shared/theme'

interface Props {
  weekDays: string[]
  today: string
  selectedDate: string
  availabilityByDate: Record<string, AvailabilityState>
  onSelectDate: (date: string) => void
  loading?: boolean   // availability unknown — show neutral shimmer dots
}

export function DateStrip({ weekDays, today, selectedDate, availabilityByDate, onSelectDate, loading }: Props) {
  const [hoveredDay, setHoveredDay] = useState<string | null>(null)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: `1px solid ${colors.borderRow}`, padding: '6px 8px 8px' }}>
      {weekDays.map(d => {
        const shortLabel = dayShortLabel(d, today)
        const num        = dayNum(d)
        const isToday    = d === today
        const isSelected = d === selectedDate
        const dotState   = availabilityByDate[d] ?? 'free'

        return (
          <button
            key={d}
            onClick={() => onSelectDate(d)}
            onMouseEnter={() => setHoveredDay(d)}
            onMouseLeave={() => setHoveredDay(null)}
            style={{
              border: 'none', background: 'none', padding: '6px 2px',
              cursor: 'pointer', display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 3, borderRadius: 10,
              backgroundColor: !isSelected && hoveredDay === d ? colors.bgSubtle : 'transparent',
              transition: 'background-color 0.12s',
            }}
          >
            <span style={{
              fontSize: '0.65rem', fontWeight: isToday || isSelected ? 700 : 500,
              color: isSelected || isToday ? colors.primary : colors.slotTakenText,
              textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap',
            }}>
              {shortLabel}
            </span>
            <span style={{
              fontSize: '0.92rem', fontWeight: 600, fontVariantNumeric: 'tabular-nums',
              color: isSelected ? colors.bgCard : isToday ? colors.primary : colors.textPrimary,
              width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: '50%',
              backgroundColor: isSelected ? colors.primary : 'transparent',
              border: isToday && !isSelected ? `1.5px solid ${colors.primaryBorder}` : '1.5px solid transparent',
              boxShadow: isSelected ? '0 2px 8px rgba(61, 122, 92, 0.35)' : 'none',
              transition: 'background-color 0.15s, box-shadow 0.15s, color 0.15s',
            }}>
              {num}
            </span>
            <span
              className={loading && !isSelected ? 'lb-skeleton' : undefined}
              style={{
                width: 5, height: 5, borderRadius: '50%', display: 'block',
                backgroundColor: loading && !isSelected
                  ? undefined
                  : isSelected ? colors.primaryBorder : (DOT_COLOR[dotState] ?? 'transparent'),
              }}
            />
          </button>
        )
      })}
    </div>
  )
}
