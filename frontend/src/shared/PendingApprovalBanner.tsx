import { useMeQuery } from '../features/auth/authApi'
import { colors } from './theme'
import { IconClock } from './icons'

export function PendingApprovalBanner() {
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
          Jeres forening afventer godkendelse. I kan opsætte vaskerum og indstillinger, men kan først invitere beboere, når foreningen er aktiveret.
        </span>
      </div>
    </div>
  )
}
