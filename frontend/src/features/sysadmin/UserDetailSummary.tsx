import { useTranslation } from 'react-i18next'
import type { SysAdminUserDetailDto } from './sysAdminApi'
import { colors } from '../../shared/theme'
import { formatDateTime } from '../../shared/utils/dateUtils'

interface Props {
  detail: SysAdminUserDetailDto
}

const label: React.CSSProperties = { fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: colors.textMuted }
const value: React.CSSProperties = { fontSize: '0.9rem', color: colors.textPrimary, fontWeight: 500 }

export function UserDetailSummary({ detail: d }: Props) {
  const { t } = useTranslation()
  const a = d.activity
  const facts: [string, string][] = [
    [t('sysadmin.userDetail.created'), formatDateTime(d.createdAt)],
    // Only recorded since #173; older accounts show "not recorded" until they next open the app
    [t('sysadmin.userDetail.lastSeen'), d.lastSeenAt ? formatDateTime(d.lastSeenAt) : t('sysadmin.userDetail.notRecorded')],
    [t('sysadmin.userDetail.termsAccepted'), d.termsAcceptedAt ? formatDateTime(d.termsAcceptedAt) : t('sysadmin.userDetail.notAccepted')],
    [t('sysadmin.userDetail.upcomingBookings'), String(a.upcomingBookings)],
    [t('sysadmin.userDetail.bookingsLast90'), String(a.bookingsLast90Days)],
    [t('sysadmin.userDetail.totalBookings'), String(a.totalBookings)],
    [t('sysadmin.userDetail.loggedChanges'), a.lastLoggedChangeAt
      ? t('sysadmin.userDetail.loggedChangesValue', { count: a.loggedChanges, date: formatDateTime(a.lastLoggedChangeAt) })
      : String(a.loggedChanges)],
  ]

  return (
    <dl className="d-grid gap-3 mb-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', margin: 0 }}>
      {facts.map(([k, v]) => (
        <div key={k}>
          <dt style={label}>{k}</dt>
          <dd className="mb-0" style={value}>{v}</dd>
        </div>
      ))}
    </dl>
  )
}
