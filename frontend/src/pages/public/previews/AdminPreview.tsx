import { useTranslation } from 'react-i18next'
import { OverviewKpis } from '../../../features/properties/OverviewKpis'
import { TodayBookingsCard } from '../../../features/properties/TodayBookingsCard'
import { NeedsAttentionCard } from '../../../features/properties/NeedsAttentionCard'
import { RoomOccupancyCard } from '../../../features/properties/RoomOccupancyCard'
import { colors } from '../../../shared/theme'
import { BrowserFrame } from './BrowserFrame'
import { PreviewAppBar } from './PreviewAppBar'
import { PREVIEW_PROPERTY, PREVIEW_ROOMS, previewTodayBookings, previewWeek } from './previewData'

interface Props {
  // 'today' for running the place day to day, 'usage' for how much the rooms are used
  focus: 'today' | 'usage'
}

// The admin's real overview cards with made-up numbers
export function AdminPreview({ focus }: Props) {
  const { t } = useTranslation()
  const { today, weekDays } = previewWeek()

  return (
    <BrowserFrame label={t(focus === 'today' ? 'public.previews.adminAlt' : 'public.previews.usageAlt')} url="laundrybook.dk/admin" designWidth={1000}>
      <PreviewAppBar admin />
      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: colors.textMuted }}>{PREVIEW_PROPERTY}</p>
          <p style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: colors.textPrimary }}>{t('nav.overview')}</p>
        </div>
        <OverviewKpis
          weekCount={38} weekDelta={6} utilization={64} busiestDay={weekDays[3] ?? null}
          residents={42} pendingInvites={3} todayCount={4} laterToday={2}
        />
        {focus === 'today' ? (
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, alignItems: 'start' }}>
            <TodayBookingsCard bookings={previewTodayBookings(today)} bookingsPath="#" />
            <NeedsAttentionCard items={[{ kind: 'pendingInvites', count: 3 }]} basePath="#" />
          </div>
        ) : (
          <RoomOccupancyCard rooms={PREVIEW_ROOMS} />
        )}
      </div>
    </BrowserFrame>
  )
}
