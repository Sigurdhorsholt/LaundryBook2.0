import { useTranslation } from 'react-i18next'
import { WeekNavigator } from '../../../features/laundry/WeekNavigator'
import { WeekGrid } from '../../../features/laundry/WeekGrid'
import { freeSlotCount, type WeekCellContext } from '../../../features/laundry/utils'
import { addDays } from '../../../shared/utils/dateUtils'
import { colors } from '../../../shared/theme'
import { BrowserFrame } from './BrowserFrame'
import { PreviewAppBar } from './PreviewAppBar'
import { previewSlots, previewWeek } from './previewData'

const noop = () => {}

// The real week grid with made-up bookings
export function WeekGridPreview() {
  const { t } = useTranslation()
  const { today, weekStart, weekDays, bookings } = previewWeek()
  const context: WeekCellContext = { today, lookaheadDays: 14, machineMode: false, machines: [], bookings }
  const freeCountByDate = Object.fromEntries(weekDays.map(d => [d, freeSlotCount(previewSlots, d, context)]))

  return (
    <BrowserFrame label={t('public.previews.weekAlt')} url="laundrybook.dk/vaskebooking" designWidth={1000}>
      <PreviewAppBar />
      <div style={{ padding: 24 }}>
        <section style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.borderDefault}`, borderRadius: 14, overflow: 'hidden' }}>
          <WeekNavigator weekStart={weekStart} weekFrom={weekStart} weekTo={addDays(weekStart, 6)} canGoBack={false} canGoForward onShift={noop} />
          <div style={{ padding: '6px 8px 8px' }}>
            <WeekGrid
              weekDays={weekDays}
              slots={previewSlots.slice(0, 7)}
              context={context}
              freeCountByDate={freeCountByDate}
              maxReached={false}
              openSlot={null}
              onOpen={noop}
            />
          </div>
        </section>
      </div>
    </BrowserFrame>
  )
}
