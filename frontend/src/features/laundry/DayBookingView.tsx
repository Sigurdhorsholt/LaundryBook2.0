import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { LaundryBooking } from './useLaundryBooking'
import { WeekNavigator } from './WeekNavigator'
import { DateStrip } from './DateStrip'
import { BookingGrid } from './BookingGrid'
import { ErrorState } from '../../shared/ui'
import { formatDateFull } from '../../shared/utils/dateUtils'
import { colors } from '../../shared/theme'
import { NAVBAR_HEIGHT_PX } from '../../shared/constants'

interface Props {
  booking: LaundryBooking
  showRoomName: boolean
}

export function DayBookingView({ booking: lb, showRoomName }: Props) {
  const { t } = useTranslation()
  // State (not a ref) so the observer attaches once the grid mounts after the session/property load
  const [gridEl, setGridEl] = useState<HTMLDivElement | null>(null)
  const [gridBelowViewport, setGridBelowViewport] = useState(false)

  useEffect(() => {
    if (!gridEl) return
    // Show the jump-to-grid button only while the whole grid is still below the screen; a ratio
    // threshold never cleared for tall grids and left the button covering the slot actions.
    const obs = new IntersectionObserver(([entry]) => {
      if (entry) setGridBelowViewport(!entry.isIntersecting && entry.boundingClientRect.top > 0)
    })
    obs.observe(gridEl)
    return () => obs.disconnect()
  }, [gridEl])

  const failed = lb.slotsQuery.isError || lb.bookingsQuery.isError

  return (
    <>
      {/* overflow: clip keeps the rounded corners without turning the card into a scroll container, which would stop the strip sticking */}
      <div ref={setGridEl} className="rounded-3" style={{ border: `1px solid ${colors.borderDefault}`, overflow: 'clip', backgroundColor: colors.bgCard }}>
        <div style={{ position: 'sticky', top: NAVBAR_HEIGHT_PX, zIndex: 5, backgroundColor: colors.bgCard }}>
          <WeekNavigator
            weekStart={lb.weekStart}
            weekFrom={lb.weekFrom}
            weekTo={lb.weekTo}
            canGoBack={lb.canGoBack}
            canGoForward={lb.canGoForward}
            onShift={lb.shiftWeek}
          />

          <DateStrip
            weekDays={lb.weekDays}
            today={lb.today}
            selectedDate={lb.selectedDate}
            availabilityByDate={lb.availabilityByDate}
            onSelectDate={lb.selectDate}
          />
        </div>

        <div style={{ padding: '8px 20px', borderBottom: `1px solid ${colors.borderRow}`, backgroundColor: colors.bgSubtle }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 500, color: colors.textSecondary }}>
            {formatDateFull(lb.selectedDate)}
            {showRoomName && lb.selectedRoom && (
              <span style={{ color: colors.textMuted, marginLeft: 8 }}>· {lb.selectedRoom.name}</span>
            )}
          </span>
        </div>

        {failed ? (
          <ErrorState
            title={t('laundryPage.loadErrorTitle')}
            description={t('laundryPage.loadErrorDescription')}
            onRetry={() => {
              if (lb.slotsQuery.isError) lb.slotsQuery.refetch()
              if (lb.bookingsQuery.isError) lb.bookingsQuery.refetch()
            }}
          />
        ) : lb.selectedRoomId ? (
          <BookingGrid
            key={lb.selectedDate}
            slots={lb.slots}
            date={lb.selectedDate}
            today={lb.today}
            bookingLookaheadDays={lb.lookaheadDays}
            gridBookings={lb.gridBookings}
            maxReached={lb.maxReached}
            bookingMode={lb.bookingMode}
            machines={lb.machines}
            machineFilter={lb.machineFilter}
            onBook={lb.handleBook}
            onCancel={lb.handleCancel}
            loading={lb.gridLoading}
            pending={lb.pending?.source === 'grid' ? lb.pending : null}
            confirmLoading={lb.confirmLoading}
            confirmError={lb.confirmError}
            onConfirm={() => lb.handleConfirm()}
            onDismissConfirm={lb.dismissConfirm}
            usage={{ used: lb.usedBookings, max: lb.maxBookings }}
          />
        ) : (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: colors.textMuted, fontSize: '0.9rem' }}>
            {t('laundryPage.selectRoom')}
          </div>
        )}

        {lb.othersBookedToday > 0 && (
          <div style={{ padding: '8px 20px', borderTop: `1px solid ${colors.borderRow}` }}>
            <p style={{ fontSize: '0.76rem', color: colors.textMuted, margin: 0, textAlign: 'center' }}>
              {t('laundryPage.othersBooked', { count: lb.othersBookedToday })}
            </p>
          </div>
        )}

        {lb.milestoneCount !== null && (
          <div style={{ padding: '8px 20px', borderTop: `1px solid ${colors.borderRow}` }}>
            <p style={{ fontSize: '0.76rem', color: colors.textSecondary, margin: 0, textAlign: 'center' }}>
              {t('laundryPage.milestone', { count: lb.milestoneCount })}
            </p>
          </div>
        )}
      </div>

      {lb.myBookings.length > 0 && gridBelowViewport && (
        <button
          aria-label={t('laundryPage.goToBooking')}
          onClick={() => gridEl?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          style={{
            position: 'fixed', bottom: 'calc(var(--bottom-bar-height, 0px) + 24px)', right: 20, zIndex: 900,
            width: 38, height: 38, borderRadius: '50%',
            border: `1px solid ${colors.primaryBorder}`,
            backgroundColor: 'rgba(255,255,255,0.92)', color: colors.primary,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 10px rgba(0,0,0,0.10)', cursor: 'pointer', backdropFilter: 'blur(4px)',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 5l5 5 5-5" stroke={colors.primary} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
    </>
  )
}
