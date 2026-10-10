import { useTranslation } from 'react-i18next'
import { useGetSystemStatusQuery } from './sysAdminApi'
import { SystemSetupList } from './SystemSetupList'
import { SystemVersionList } from './SystemVersionList'
import { colors } from '../../shared/theme'

const label: React.CSSProperties = { fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: colors.textMuted }
const value: React.CSSProperties = { fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.5px', lineHeight: 1.15, color: colors.textPrimary }
const note: React.CSSProperties = { fontSize: '0.8rem', color: colors.textMuted }

// Platform totals and how the running backend is configured, at the top of /system
export function SystemStatusCard() {
  const { t } = useTranslation()
  const { data: s, isError } = useGetSystemStatusQuery()

  if (isError) return <p className="mb-0" role="alert" style={{ color: colors.dangerText, fontSize: '0.9rem' }}>{t('sysadmin.status.loadError')}</p>
  if (!s) return <p className="mb-0" style={{ color: colors.textSecondary, fontSize: '0.9rem' }}>{t('sysadmin.loading')}</p>

  const totals: { key: string; label: string; value: number; note?: string }[] = [
    {
      key: 'properties',
      label: t('sysadmin.status.properties'),
      value: s.activeProperties,
      note: s.pendingProperties > 0
        ? t('sysadmin.status.propertiesPending', { count: s.pendingProperties })
        : t('sysadmin.status.noPropertiesPending'),
    },
    { key: 'users', label: t('sysadmin.status.users'), value: s.users },
    { key: 'bookings', label: t('sysadmin.status.bookingsThisWeek'), value: s.bookingsThisWeek },
    { key: 'invites', label: t('sysadmin.status.pendingInvites'), value: s.pendingInvites },
  ]

  return (
    <>
      <h2 className="mb-3" style={{ fontSize: '1rem', fontWeight: 600, color: colors.textPrimary }}>{t('sysadmin.status.title')}</h2>
      <dl className="d-grid gap-3 mb-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', margin: 0 }}>
        {totals.map(x => (
          <div key={x.key} className="rounded-2 p-3" style={{ border: `1px solid ${colors.borderDefault}`, backgroundColor: colors.bgSubtle }}>
            <dt style={label}>{x.label}</dt>
            <dd className="mb-0" style={value}>{x.value}</dd>
            {x.note && <dd className="mb-0" style={note}>{x.note}</dd>}
          </div>
        ))}
      </dl>
      <div className="row g-4">
        <div className="col-lg-6"><SystemSetupList status={s} /></div>
        <div className="col-lg-6"><SystemVersionList status={s} /></div>
      </div>
    </>
  )
}
