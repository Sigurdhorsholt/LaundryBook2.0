import { useTranslation } from 'react-i18next'
import { useMeQuery } from '../features/auth/authApi'
import { colors } from './theme'
import { IconClock } from './icons'

export function PendingApprovalBanner() {
  const { t } = useTranslation()
  const { data: user } = useMeQuery()
  const hasPending = user?.memberships.some((m) => !m.propertyIsActive) ?? false

  if (!hasPending) return null

  return (
    <div style={{ backgroundColor: colors.warningBg, borderBottom: `1px solid ${colors.warningBorder}` }}>
      <div
        className="container-xl px-4 py-2 d-flex align-items-center gap-2"
        style={{ color: colors.warningText, fontSize: '0.88rem' }}
      >
        <IconClock size={16} />
        <span>
          {t('layout.pendingApproval')}
        </span>
      </div>
    </div>
  )
}
