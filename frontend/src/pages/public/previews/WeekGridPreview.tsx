import { useLayoutEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { WeekNavigator } from '../../../features/laundry/WeekNavigator'
import { WeekGrid } from '../../../features/laundry/WeekGrid'
import { WeekSlotPopoverBody } from '../../../features/laundry/WeekSlotPopoverBody'
import { freeSlotCount, weekCell, type WeekCellContext } from '../../../features/laundry/utils'
import { addDays } from '../../../shared/utils/dateUtils'
import { colors } from '../../../shared/theme'
import { POPOVER_SURFACE } from '../../../shared/ui/popoverSurface'
import { BrowserFrame } from './BrowserFrame'
import { PreviewAppBar } from './PreviewAppBar'
import { PREVIEW_ROOM, previewSlots, previewWeek } from './previewData'

interface Props {
  // Shows the booking popover open on a free time, as when a resident has just clicked it
  withPopover?: boolean
}

const noop = () => {}
const POPOVER_WIDTH = 300
const GAP = 8

// The real week grid with made-up bookings
export function WeekGridPreview({ withPopover = false }: Props) {
  const { t } = useTranslation()
  const wrap = useRef<HTMLDivElement>(null)
  const popover = useRef<HTMLDivElement>(null)
  const { today, weekStart, weekDays, bookings, openSlot } = previewWeek()
  const context: WeekCellContext = { today, lookaheadDays: 14, machineMode: false, machines: [], bookings }
  const freeCountByDate = Object.fromEntries(weekDays.map(d => [d, freeSlotCount(previewSlots, d, context)]))
  const shown = withPopover ? openSlot : null
  const slot = shown ? previewSlots.find(s => s.id === shown.slotId) : undefined
  const cell = slot && shown ? weekCell(slot, shown.date, context) : null

  // Placed beside the open cell like the real popover, but inside the frame so it scales with it
  useLayoutEffect(() => {
    const w = wrap.current
    const p = popover.current
    const anchor = w?.querySelector<HTMLElement>('[aria-expanded="true"]')
    if (!w || !p || !anchor) return
    let x = 0
    let y = 0
    for (let n: HTMLElement | null = anchor; n && n !== w; n = n.offsetParent as HTMLElement | null) {
      x += n.offsetLeft
      y += n.offsetTop
    }
    const right = x + anchor.offsetWidth + GAP
    p.style.left = `${right + POPOVER_WIDTH > w.offsetWidth ? x - GAP - POPOVER_WIDTH : right}px`
    p.style.top = `${Math.max(GAP, Math.min(y - 40, w.offsetHeight - p.offsetHeight - GAP))}px`
  })

  return (
    <BrowserFrame label={t(withPopover ? 'public.previews.bookAlt' : 'public.previews.weekAlt')} url="laundrybook.dk/vaskebooking" designWidth={1000}>
      <PreviewAppBar />
      <div ref={wrap} style={{ padding: 24, position: 'relative' }}>
        <section style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.borderDefault}`, borderRadius: 14, overflow: 'hidden' }}>
          <WeekNavigator weekStart={weekStart} weekFrom={weekStart} weekTo={addDays(weekStart, 6)} canGoBack={false} canGoForward onShift={noop} />
          <div style={{ padding: '6px 8px 8px' }}>
            <WeekGrid
              weekDays={weekDays}
              slots={previewSlots.slice(0, 7)}
              context={context}
              freeCountByDate={freeCountByDate}
              maxReached={false}
              openSlot={shown ? { slotId: shown.slotId, date: shown.date } : null}
              onOpen={noop}
            />
          </div>
        </section>
        {slot && shown && cell && (cell.kind === 'free' || cell.kind === 'own') && (
          <div ref={popover} style={{ ...POPOVER_SURFACE, position: 'absolute', width: POPOVER_WIDTH, zIndex: 2 }}>
            <WeekSlotPopoverBody
              titleId="preview-popover-title"
              cell={cell}
              slot={slot}
              date={shown.date}
              context={context}
              roomName={PREVIEW_ROOM}
              maxReached={false}
              loading={false}
              error={null}
              onBook={noop}
              onCancel={noop}
              onClose={noop}
            />
          </div>
        )}
      </div>
    </BrowserFrame>
  )
}
