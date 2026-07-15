import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { colors } from '../../shared/theme'
import { useGetAuditLogsQuery } from './sysAdminApi'

const PAGE_SIZE = 25
const ACTIONS = ['Created', 'Updated', 'Deleted'] as const

function actionColor(action: string): string {
  if (action === 'Created') return colors.primary
  if (action === 'Deleted') return colors.dangerText
  return colors.textSecondary
}

function prettyChanges(changes: string): string {
  try {
    return JSON.stringify(JSON.parse(changes), null, 2)
  } catch {
    return changes
  }
}

export function AuditLogTable() {
  const { t } = useTranslation()
  const tx = t as (key: string) => string
  const [page, setPage] = useState(1)
  const [entityType, setEntityType] = useState('')
  const [action, setAction] = useState('')

  const { data, isLoading, isError } = useGetAuditLogsQuery({
    entityType: entityType || undefined,
    action: action || undefined,
    page,
    pageSize: PAGE_SIZE,
  })

  const total = data?.totalCount ?? 0
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const to = Math.min(page * PAGE_SIZE, total)

  function resetTo(setter: (v: string) => void, value: string) {
    setter(value)
    setPage(1)
  }

  return (
    <div>
      <h2 className="fw-bold mb-1" style={{ fontSize: '1.1rem', color: colors.textPrimary }}>{t('sysadmin.audit.title')}</h2>
      <p className="mb-3" style={{ color: colors.textSecondary, fontSize: '0.875rem' }}>{t('sysadmin.audit.description')}</p>

      <div className="d-flex flex-wrap gap-2 mb-3">
        <input
          className="form-control form-control-sm"
          style={{ maxWidth: 280 }}
          placeholder={t('sysadmin.audit.filterEntityPlaceholder')}
          value={entityType}
          onChange={(e) => resetTo(setEntityType, e.target.value)}
        />
        <select className="form-select form-select-sm" style={{ maxWidth: 200 }} value={action} onChange={(e) => resetTo(setAction, e.target.value)}>
          <option value="">{t('sysadmin.audit.filterActionAll')}</option>
          {ACTIONS.map((a) => (
            <option key={a} value={a}>{tx(`sysadmin.audit.action${a}`)}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <p style={{ color: colors.textMuted, fontSize: '0.875rem' }}>{t('common.loading')}</p>
      ) : isError ? (
        <p style={{ color: colors.dangerText, fontSize: '0.875rem' }}>{t('sysadmin.audit.loadError')}</p>
      ) : total === 0 ? (
        <p style={{ color: colors.textMuted, fontSize: '0.875rem' }}>{t('sysadmin.audit.empty')}</p>
      ) : (
        <>
          <div style={{ overflowX: 'auto' }}>
            <table className="table table-sm align-middle" style={{ fontSize: '0.83rem' }}>
              <thead>
                <tr style={{ color: colors.textSecondary }}>
                  <th>{t('sysadmin.audit.colTime')}</th>
                  <th>{t('sysadmin.audit.colUser')}</th>
                  <th>{t('sysadmin.audit.colAction')}</th>
                  <th>{t('sysadmin.audit.colEntity')}</th>
                  <th>{t('sysadmin.audit.colChanges')}</th>
                </tr>
              </thead>
              <tbody>
                {data!.items.map((log) => (
                  <tr key={log.id}>
                    <td style={{ whiteSpace: 'nowrap', color: colors.textSecondary }}>{new Date(log.timestampUtc).toLocaleString()}</td>
                    <td style={{ color: colors.textPrimary }}>{log.userEmail ?? (log.userId ? log.userId.slice(0, 8) : t('sysadmin.audit.system'))}</td>
                    <td style={{ fontWeight: 600, color: actionColor(log.action) }}>{tx(`sysadmin.audit.action${log.action}`)}</td>
                    <td style={{ color: colors.textSecondary }}>{log.entityType} · {log.entityId.slice(0, 8)}</td>
                    <td>
                      {log.changes && (
                        <details>
                          <summary style={{ cursor: 'pointer', color: colors.primary }}>{t('sysadmin.audit.viewChanges')}</summary>
                          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.75rem', marginTop: 6, color: colors.textSecondary }}>{prettyChanges(log.changes)}</pre>
                        </details>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="d-flex align-items-center justify-content-between mt-2">
            <span style={{ color: colors.textMuted, fontSize: '0.8rem' }}>{t('sysadmin.audit.showing', { from, to, total })}</span>
            <div className="d-flex gap-2">
              <button className="btn btn-sm btn-outline-secondary" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>{t('sysadmin.audit.prev')}</button>
              <button className="btn btn-sm btn-outline-secondary" disabled={page * PAGE_SIZE >= total} onClick={() => setPage((p) => p + 1)}>{t('sysadmin.audit.next')}</button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
