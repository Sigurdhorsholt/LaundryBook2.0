import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { LaundryBooking } from './useLaundryBooking'
import { WeekNavigator } from './WeekNavigator'
import { WeekGrid } from './WeekGrid'
import { WeekSlotPopover } from './WeekSlotPopover'
import { ErrorState } from '../../shared/ui'
import { colors } from '../../shared/theme'

interface Props {
  booking: LaundryBooking
}

const card: React.CSSProperties = {
  backgroundColor: colors.bgCard, border: `1px solid ${colors.borderDefault}`, borderRadius: 14,
  overflow: 'hidden', boxShadow: '0 1px 2px rgba(18,32,26,0.06), 0 8px 24px rgba(18,32,26,0.06)',
}

export function WeekBookingView({ booking: lb }: Props) {
  const { t } = useTranslation()
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  const failed = lb.slotsQuery.isError || lb.bookingsQuery.isError
  const openSlot = lb.weekSlot ? lb.slots.find(s => s.id === lb.weekSlot?.slotId) : undefined

  function toggleSlot(slotId: string, date: string, el: HTMLElement) {
    if (lb.weekSlot?.slotId === slotId && lb.weekSlot.date === date) {
      lb.closeWeekSlot()
      return
    }
    setAnchor(el)
    lb.openWeekSlot(slotId, date)
  }

  function body() {
    if (failed) {
      return (
        <ErrorState
          title={t('laundryPage.loadErrorTitle')}
          description={t('laundryPage.loadErrorDescription')}
          onRetry={() => {
            if (lb.slotsQuery.isError) lb.slotsQuery.refetch()
            if (lb.bookingsQuery.isError) lb.bookingsQuery.refetch()
          }}
        />
      )
    }
    if (lb.gridLoading) {
      return <div style={{ height: 420, backgroundColor: colors.bgSubtle, animation: 'skeleton-pulse 1.4s ease-in-out infinite' }} />
    }
    if (lb.slots.length === 0 || (lb.machineMode && lb.machines.length === 0)) {
      const noSlots = lb.slots.length === 0
      return (
        <div style={{ padding: '40px 20px', textAlign: 'center' }}>
          <p style={{ color: colors.textPrimary, fontWeight: 600, marginBottom: 4 }}>
            {t(noSlots ? 'laundry.grid.noSlotsTitle' : 'laundry.grid.noMachinesTitle')}
          </p>
          <p style={{ color: colors.textMuted, fontSize: '0.85rem', marginBottom: 0 }}>
            {t(noSlots ? 'laundry.grid.noSlotsDescription' : 'laundry.grid.noMachinesDescription')}
          </p>
        </div>
      )
    }
    return (
      <WeekGrid
        weekDays={lb.weekDays}
        slots={lb.slots}
        context={lb.cellContext}
        freeCountByDate={lb.freeCountByDate}
        maxReached={lb.maxReached}
        openSlot={lb.weekSlot}
        onOpen={toggleSlot}
      />
    )
  }

  return (
    <section aria-label={t('laundry.week.caption')} style={card}>
      <WeekNavigator
        weekStart={lb.weekStart}
        weekFrom={lb.weekFrom}
        weekTo={lb.weekTo}
        canGoBack={lb.canGoBack}
        canGoForward={lb.canGoForward}
        onShift={lb.shiftWeek}
      />
      {lb.maxReached && !failed && (
        <div
          role="status"
          style={{
            padding: '10px 16px', fontSize: '0.85rem', display: 'flex', gap: 6, flexWrap: 'wrap',
            backgroundColor: colors.slotWarningBg, borderBottom: `1px solid ${colors.slotWarningBorder}`, color: colors.slotWarningText,
          }}
        >
          <strong>{t('laundry.grid.limitReachedTitle')}</strong>
          <span>{t('laundry.grid.limitReachedHint')}</span>
        </div>
      )}
      <div style={{ padding: '6px 8px 8px' }}>{body()}</div>
      {lb.milestoneCount !== null && (
        <p style={{ margin: 0, padding: '8px 20px', borderTop: `1px solid ${colors.borderRow}`, fontSize: '0.78rem', color: colors.textSecondary, textAlign: 'center' }}>
          {t('laundryPage.milestone', { count: lb.milestoneCount })}
        </p>
      )}
      {lb.weekSlot && openSlot && anchor && (
        <WeekSlotPopover
          key={`${lb.weekSlot.slotId}|${lb.weekSlot.date}`}
          anchor={anchor}
          slot={openSlot}
          date={lb.weekSlot.date}
          context={lb.cellContext}
          roomName={lb.selectedRoom?.name ?? null}
          maxReached={lb.maxReached}
          loading={lb.confirmLoading}
          error={lb.confirmError}
          onBook={lb.bookWeekSlot}
          onCancel={lb.cancelWeekBooking}
          onClose={lb.closeWeekSlot}
        />
      )}
    </section>
  )
}
