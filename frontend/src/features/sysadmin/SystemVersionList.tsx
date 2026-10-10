import { useTranslation } from 'react-i18next'
import type { SystemStatusDto } from './sysAdminApi'
import { FRONTEND_COMMIT, GITHUB_COMMIT_URL, RENDER_DASHBOARD_URL, SENTRY_URL } from './constants'
import { colors } from '../../shared/theme'
import { formatDateTime } from '../../shared/utils/dateUtils'

interface Props {
  status: SystemStatusDto
}

const heading: React.CSSProperties = { fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: colors.textMuted }
const row: React.CSSProperties = { borderTop: `1px solid ${colors.borderRow}`, padding: '8px 0', fontSize: '0.875rem' }

function Commit({ sha }: { sha: string | null }) {
  const { t } = useTranslation()
  if (!sha) return <span style={{ color: colors.textMuted }}>{t('sysadmin.status.localBuild')}</span>
  return (
    <a href={`${GITHUB_COMMIT_URL}${sha}`} target="_blank" rel="noreferrer" title={sha} style={{ fontFamily: 'ui-monospace, monospace', color: colors.primary }}>
      {sha.slice(0, 7)}
    </a>
  )
}

export function SystemVersionList({ status: s }: Props) {
  const { t } = useTranslation()

  return (
    <section>
      <h3 className="mb-2" style={heading}>{t('sysadmin.status.version')}</h3>
      <dl className="mb-3">
        <div className="d-flex justify-content-between gap-3" style={row}>
          <dt style={{ fontWeight: 500, color: colors.textSecondary }}>{t('sysadmin.status.backend')}</dt>
          <dd className="mb-0 text-end" style={{ color: colors.textPrimary }}>
            <Commit sha={s.commit} />
            <span style={{ color: colors.textMuted }}> · {t('sysadmin.status.startedAt', { date: formatDateTime(s.startedAt) })}</span>
          </dd>
        </div>
        <div className="d-flex justify-content-between gap-3" style={row}>
          <dt style={{ fontWeight: 500, color: colors.textSecondary }}>{t('sysadmin.status.frontend')}</dt>
          <dd className="mb-0 text-end"><Commit sha={FRONTEND_COMMIT} /></dd>
        </div>
      </dl>

      <h3 className="mb-1" style={heading}>{t('sysadmin.status.errorsAndLogs')}</h3>
      <p className="mb-2" style={{ fontSize: '0.85rem', color: colors.textSecondary }}>{t('sysadmin.status.errorsHint')}</p>
      <div className="d-flex flex-wrap gap-2">
        <a href={SENTRY_URL} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-secondary">{t('sysadmin.status.openSentry')}</a>
        <a href={RENDER_DASHBOARD_URL} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-secondary">{t('sysadmin.status.openRender')}</a>
      </div>
    </section>
  )
}
