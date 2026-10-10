import { colors } from '../../shared/theme'
import type { SystemInviteStatus } from './sysAdminApi'

export const SYSTEM_TABLE_HEAD: React.CSSProperties = {
  padding: '8px 12px', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
  color: colors.textMuted, backgroundColor: colors.bgHeader, whiteSpace: 'nowrap',
}

export const SYSTEM_TABLE_CELL: React.CSSProperties = {
  padding: '10px 12px', borderTop: `1px solid ${colors.borderRow}`, fontSize: '0.85rem', verticalAlign: 'middle',
}

export const FRONTEND_COMMIT: string | null = import.meta.env.VITE_GIT_COMMIT || null
export const GITHUB_COMMIT_URL = 'https://github.com/Sigurdhorsholt/LaundryBook2.0/commit/'
export const SENTRY_URL = 'https://sentry.io/'
export const RENDER_DASHBOARD_URL = 'https://dashboard.render.com/'

export const INVITES_EMPTY_KEY = {
  Pending: 'sysadmin.invites.emptyPending',
  Expired: 'sysadmin.invites.emptyExpired',
  SharedLink: 'sysadmin.invites.emptyShared',
} as const satisfies Record<SystemInviteStatus, string>
