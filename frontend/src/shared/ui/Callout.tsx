import { IconAlertTriangle, IconLock } from '../icons'
import { colors } from '../theme'

interface CalloutProps {
  // 'lock' when a setting or action is blocked, 'alert' when something is missing
  icon?: 'lock' | 'alert'
  title?: string
  children: React.ReactNode
  action?: React.ReactNode
}

// Sits between help text and errors: nothing failed, but something stands in the way and the admin
// needs to see why and what to do. Amber so it stands out without reading as an error.
export function Callout({ icon = 'alert', title, children, action }: CalloutProps) {
  const Icon = icon === 'lock' ? IconLock : IconAlertTriangle

  return (
    <div
      role="status"
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 10,
        padding: '12px 14px', borderRadius: 10,
        backgroundColor: colors.warningBg,
        border: `1px solid ${colors.warningBorder}`,
        borderLeft: `4px solid ${colors.warningText}`,
        color: colors.warningText,
      }}
    >
      <span aria-hidden="true" style={{ display: 'flex', flexShrink: 0, marginTop: 1 }}>
        <Icon size={18} strokeWidth={2.2} />
      </span>
      <div style={{ flex: 1, minWidth: 0, fontSize: '0.86rem', lineHeight: 1.45 }}>
        {title && <p style={{ margin: '0 0 2px', fontWeight: 700 }}>{title}</p>}
        <div>{children}</div>
        {action && <div style={{ marginTop: 6, fontWeight: 600 }}>{action}</div>}
      </div>
    </div>
  )
}
