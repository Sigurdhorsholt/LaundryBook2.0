import { useTranslation } from 'react-i18next'
import type { SystemStatusDto } from './sysAdminApi'
import { IconAlertTriangle, IconCheck } from '../../shared/icons'
import { colors } from '../../shared/theme'

interface Props {
  status: SystemStatusDto
}

const heading: React.CSSProperties = { fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: colors.textMuted }
const row: React.CSSProperties = { borderTop: `1px solid ${colors.borderRow}`, padding: '8px 0', fontSize: '0.875rem' }

// A fallback (dev logger, dev login, no Sentry) is fine locally but wrong in production, so it is flagged
export function SystemSetupList({ status: s }: Props) {
  const { t } = useTranslation()
  const rows: { key: string; label: string; value: string; ok?: boolean }[] = [
    { key: 'environment', label: t('sysadmin.status.environment'), value: s.environment },
    {
      key: 'email',
      label: t('sysadmin.status.email'),
      value: s.emailConfigured ? t('sysadmin.status.emailMailgun') : t('sysadmin.status.emailDev'),
      ok: s.emailConfigured,
    },
    {
      key: 'login',
      label: t('sysadmin.status.login'),
      value: s.firebaseConfigured ? t('sysadmin.status.loginFirebase') : t('sysadmin.status.loginDev'),
      ok: s.firebaseConfigured,
    },
    {
      key: 'errors',
      label: t('sysadmin.status.errorTracking'),
      value: s.errorTrackingConfigured ? t('sysadmin.status.errorTrackingOn') : t('sysadmin.status.errorTrackingOff'),
      ok: s.errorTrackingConfigured,
    },
  ]

  return (
    <section>
      <h3 className="mb-2" style={heading}>{t('sysadmin.status.setup')}</h3>
      <dl className="mb-0">
        {rows.map(r => (
          <div key={r.key} className="d-flex justify-content-between gap-3" style={row}>
            <dt style={{ fontWeight: 500, color: colors.textSecondary }}>{r.label}</dt>
            <dd className="mb-0 d-flex align-items-center gap-2 text-end" style={{ color: colors.textPrimary, fontWeight: 500 }}>
              {r.ok === true && <IconCheck size={14} color={colors.successText} />}
              {r.ok === false && <IconAlertTriangle size={14} color={colors.warningText} />}
              {r.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
