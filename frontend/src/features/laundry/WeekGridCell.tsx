import { useTranslation } from 'react-i18next'
import type { BookingDto, LaundryMachineDto } from './laundryApi'
import type { WeekCell } from './types'
import { colors } from '../../shared/theme'

interface Props {
  cell: WeekCell
  // "Torsdag 8. okt 16:00–17:30": names the cell for screen readers, since a button only says "Book"
  slotLabel: string
  totalMachines: number
  maxReached: boolean
  onBook: (freeMachines: LaundryMachineDto[]) => void
  onCancel: (booking: BookingDto) => void
}

const box: React.CSSProperties = {
  width: '100%', minHeight: 48, boxSizing: 'border-box', borderRadius: 9,
  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
  padding: '4px 6px', fontSize: '0.78rem', textAlign: 'center', lineHeight: 1.25,
}

export function WeekGridCell({ cell, slotLabel, totalMachines, maxReached, onBook, onCancel }: Props) {
  const { t } = useTranslation()

  switch (cell.kind) {
    case 'own':
      return (
        <div className="d-flex flex-column gap-1" style={{ width: '100%' }}>
          <div style={{ ...box, backgroundColor: colors.slotOwnBg, color: colors.slotOwnText }}>
            {cell.bookings.map(b => (
              <span key={b.id} className="d-flex flex-column align-items-center">
                <span style={{ fontWeight: 700 }}>{b.machineName ?? t('laundry.week.yours')}</span>
                {b.canCancel ? (
                  <button
                    type="button"
                    aria-label={t('laundry.actions.cancelSlot', { time: [slotLabel, b.machineName].filter(Boolean).join(' · ') })}
                    onClick={() => onCancel(b)}
                    style={{ background: 'none', border: 'none', padding: '2px 6px', color: colors.slotOwnText, fontSize: '0.76rem', textDecoration: 'underline', cursor: 'pointer' }}
                  >
                    {t('laundry.actions.cancelBooking')}
                  </button>
                ) : (
                  <span style={{ fontSize: '0.72rem' }}>{t('laundry.slot.cancelDeadlinePassed')}</span>
                )}
              </span>
            ))}
          </div>
          {cell.freeMachines.length > 0 && (
            <button
              type="button"
              className="btn btn-outline-primary fw-semibold"
              disabled={maxReached}
              title={maxReached ? t('laundry.grid.limitReachedHint') : undefined}
              aria-label={t('laundry.actions.bookSlot', { time: slotLabel })}
              onClick={() => onBook(cell.freeMachines)}
              style={{ ...box, minHeight: 36, borderWidth: 1.5, fontSize: '0.76rem', padding: '2px 6px' }}
            >
              {t('laundry.week.bookAnother')}
              <span style={{ fontWeight: 500, fontSize: '0.68rem' }}>
                {t('laundry.slot.freeCount', { free: cell.freeMachines.length, total: totalMachines })}
              </span>
            </button>
          )}
        </div>
      )
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
          className="btn btn-outline-primary fw-semibold"
          disabled={maxReached}
          title={maxReached ? t('laundry.grid.limitReachedHint') : undefined}
          aria-label={t('laundry.actions.bookSlot', { time: slotLabel })}
          onClick={() => onBook(cell.freeMachines)}
          style={{ ...box, borderWidth: 1.5, fontSize: '0.82rem' }}
        >
          {t('laundry.actions.book')}
          {totalMachines > 0 && (
            <span style={{ fontWeight: 500, fontSize: '0.7rem' }}>
              {t('laundry.slot.freeCount', { free: cell.freeMachines.length, total: totalMachines })}
            </span>
          )}
        </button>
      )
  }
}
