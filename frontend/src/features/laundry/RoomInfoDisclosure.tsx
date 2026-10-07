import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { LaundryMachineDto, LaundryRoomDto } from './laundryApi'
import { RoomInfoDetails } from './RoomInfoCard'
import type { RoomRules } from './types'
import { IconChevronDown } from '../../shared/icons'
import { colors } from '../../shared/theme'
import { SIDE_CARD, TAP_TARGET_PX } from './constants'

interface Props {
  room: LaundryRoomDto
  machines: LaundryMachineDto[]
  rules: RoomRules
}

export function RoomInfoDisclosure({ room, machines, rules }: Props) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const subtitle = [room.name, room.description].filter(Boolean).join(' · ')

  return (
    <section style={{ ...SIDE_CARD, padding: 0, overflow: 'hidden' }}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(x => !x)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 12, minHeight: TAP_TARGET_PX + 16,
          padding: '10px 16px', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer',
        }}
      >
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: 'block', fontSize: '0.95rem', fontWeight: 700, color: colors.textPrimary }}>{t('laundry.room.disclosureTitle')}</span>
          <span style={{ display: 'block', fontSize: '0.82rem', color: colors.textMuted }}>{subtitle}</span>
        </span>
        <span aria-hidden="true" style={{ display: 'inline-flex', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>
          <IconChevronDown size={18} color={colors.textSecondary} strokeWidth={2} />
        </span>
      </button>
      {open && (
        <div id={panelId} style={{ padding: '0 16px 16px', borderTop: `1px solid ${colors.borderRow}` }}>
          <RoomInfoDetails machines={machines} rules={rules} />
        </div>
      )}
    </section>
  )
}
