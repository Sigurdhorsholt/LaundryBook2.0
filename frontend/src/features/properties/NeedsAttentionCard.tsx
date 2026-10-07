import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { OverviewAttentionItem } from './types'
import { IconCheck } from '../../shared/icons'
import { colors } from '../../shared/theme'
import { OVERVIEW_CARD } from './constants'

interface Props {
  items: OverviewAttentionItem[]
  basePath: string
}

export function NeedsAttentionCard({ items, basePath }: Props) {
  const { t } = useTranslation()

  function describe(item: OverviewAttentionItem) {
    switch (item.kind) {
      case 'pendingInvites':
        return { text: t('adminOverview.attention.pendingInvites', { count: item.count }), link: `${basePath}/users`, action: t('adminOverview.attention.seeInvites') }
      case 'noSlots':
        return { text: t('adminOverview.attention.noSlots', { room: item.roomName }), link: `${basePath}/timeslots`, action: t('adminOverview.attention.addSlots') }
      case 'noMachines':
        return { text: t('adminOverview.attention.noMachines', { room: item.roomName }), link: `${basePath}/laundry`, action: t('adminOverview.attention.addMachines') }
    }
  }

  return (
    <section style={OVERVIEW_CARD}>
      <h2 style={{ margin: '0 0 10px', fontSize: '1rem', fontWeight: 700, color: colors.textPrimary }}>{t('adminOverview.attention.title')}</h2>
      {items.length === 0 ? (
        <p className="d-flex align-items-center gap-2 mb-0" style={{ fontSize: '0.88rem', color: colors.textSecondary }}>
          <IconCheck size={16} color={colors.successText} />
          {t('adminOverview.attention.allGood')}
        </p>
      ) : (
        <ul className="list-unstyled d-flex flex-column gap-2 mb-0">
          {items.map(item => {
            const d = describe(item)
            return (
              <li
                key={`${item.kind}-${'roomName' in item ? item.roomName : ''}`}
                className="d-flex justify-content-between align-items-center gap-2"
                style={{ padding: '10px 12px', borderRadius: 10, backgroundColor: colors.warningBg, border: `1px solid ${colors.warningBorder}` }}
              >
                <span style={{ fontSize: '0.86rem', color: colors.slotWarningText }}>{d.text}</span>
                <Link to={d.link} style={{ fontSize: '0.82rem', fontWeight: 600, whiteSpace: 'nowrap' }}>{d.action}</Link>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
