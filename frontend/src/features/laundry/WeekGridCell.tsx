import { useTranslation } from 'react-i18next'
import type { WeekCell } from './types'
import { IconCheck } from '../../shared/icons'
import { colors } from '../../shared/theme'

interface Props {
  cell: WeekCell
  // "Torsdag 8. okt 16:00–17:30": names the cell for screen readers, since a button only says "Book"
  slotLabel: string
  machineMode: boolean
  maxReached: boolean
  expanded: boolean
  onOpen: (anchor: HTMLElement) => void
}

const box: React.CSSProperties = {
  width: '100%', minHeight: 44, boxSizing: 'border-box', borderRadius: 9,
  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
  padding: '4px 6px', fontSize: '0.78rem', textAlign: 'center', lineHeight: 1.2,
}

const subLine: React.CSSProperties = {
  fontSize: '0.7rem', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
}

export function WeekGridCell({ cell, slotLabel, machineMode, maxReached, expanded, onOpen }: Props) {
  const { t } = useTranslation()
  const ring = expanded ? `0 0 0 2px ${colors.bgCard}, 0 0 0 4px ${colors.primary}` : undefined

  switch (cell.kind) {
    case 'own': {
      // Machine names come from the admin and can be any length, so the cell only names one and the popover lists them
      const sub = !machineMode ? null
        : cell.bookings.length === 1 ? cell.bookings[0].machineName
        : t('laundry.week.machinesCount', { count: cell.bookings.length })
      const canAct = cell.bookings.some(b => b.canCancel) || cell.freeMachines.length > 0
      const content = (
        <>
          <span className="d-inline-flex align-items-center gap-1" style={{ fontWeight: 700 }}>
            <IconCheck size={12} strokeWidth={3} />
            {t('laundry.week.yours')}
          </span>
          {sub && <span style={subLine}>{sub}</span>}
          {canAct
            ? cell.freeMachines.length > 0 && (
                <span style={{ ...subLine, fontWeight: 700, color: colors.primaryMutedText }}>
                  {t('laundry.week.moreFree', { count: cell.freeMachines.length })}
                </span>
              )
            : <span style={{ ...subLine, whiteSpace: 'normal' }}>{t('laundry.slot.cancelDeadlinePassed')}</span>}
        </>
      )
      if (!canAct) {
        return <div style={{ ...box, backgroundColor: colors.slotOwnBg, color: colors.slotOwnText }}>{content}</div>
      }
      return (
        <button
          type="button"
          className="week-own-cell"
          aria-haspopup="dialog"
          aria-expanded={expanded}
          aria-label={t('laundry.week.ownSlotAria', { time: slotLabel })}
          onClick={e => onOpen(e.currentTarget)}
          style={{ ...box, border: 'none', backgroundColor: colors.slotOwnBg, color: colors.slotOwnText, cursor: 'pointer', boxShadow: ring }}
        >
          {content}
        </button>
      )
    }
    case 'taken':
    case 'full':
      return (
        <div style={{ ...box, backgroundColor: colors.slotTakenBg, color: colors.slotTakenText, fontWeight: 600 }}>
          {cell.kind === 'taken' ? cell.label : t('laundry.slot.fullyBooked')}
        </div>
      )
    case 'past':
      return (
        <div
          role="img"
          aria-label={t('laundry.slot.past')}
          style={{ ...box, backgroundColor: colors.bgSubtle, border: `1px dashed ${colors.borderDefault}` }}
        />
      )
    case 'locked':
      return (
        <div role="img" aria-label={t('laundry.slot.unavailable')} style={{ ...box, backgroundColor: colors.bgSubtle }} />
      )
    case 'free':
      return (
        <button
          type="button"
          className={`btn btn-outline-primary fw-semibold${expanded ? ' active' : ''}`}
          disabled={maxReached}
          title={maxReached ? t('laundry.grid.limitReachedHint') : undefined}
          aria-haspopup="dialog"
          aria-expanded={expanded}
          aria-label={t('laundry.actions.bookSlot', { time: slotLabel })}
          onClick={e => onOpen(e.currentTarget)}
          style={{ ...box, borderWidth: 1.5, fontSize: '0.82rem', boxShadow: ring }}
        >
          {t('laundry.actions.book')}
          {machineMode && (
            <span style={{ fontWeight: 500, fontSize: '0.7rem' }}>
              {t('laundry.week.freeCount', { count: cell.freeMachines.length })}
            </span>
          )}
        </button>
      )
  }
}
