import { useId } from 'react'
import type { BookingDto, TimeSlotTemplateDto } from './laundryApi'
import { weekCell, type WeekCellContext } from './utils'
import { WeekSlotPopoverBody } from './WeekSlotPopoverBody'
import { AnchoredPopover } from '../../shared/ui'

interface Props {
  anchor: HTMLElement
  slot: TimeSlotTemplateDto
  date: string
  context: WeekCellContext
  roomName: string | null
  maxReached: boolean
  loading: boolean
  error: string | null
  onBook: (machineId?: string) => void
  onCancel: (booking: BookingDto) => void
  onClose: () => void
}

export function WeekSlotPopover({ anchor, onClose, ...body }: Props) {
  const titleId = useId()
  const cell = weekCell(body.slot, body.date, body.context)
  // A refetch can leave nothing to do here, e.g. when someone else booked the slot first
  if (cell.kind !== 'own' && cell.kind !== 'free') return null

  return (
    <AnchoredPopover anchor={anchor} labelledBy={titleId} onClose={onClose}>
      <WeekSlotPopoverBody {...body} titleId={titleId} cell={cell} onClose={onClose} />
    </AnchoredPopover>
  )
}
