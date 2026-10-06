import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useGetPendingPropertiesQuery, useActivatePropertyMutation } from './sysAdminApi'
import { colors } from '../../shared/theme'
import { formatDateFull } from '../../shared/utils/dateUtils'
import { extractErrorMessage } from '../../shared/utils/errorUtils'
import { FormError } from '../../shared/ui'

export function PendingPropertiesList() {
  const { t } = useTranslation()
  const { data: pending = [], isLoading } = useGetPendingPropertiesQuery()
  const [activate] = useActivatePropertyMutation()
  // Per row: one shared isLoading used to show "Activating…" on every row at once
  const [activatingId, setActivatingId] = useState<string | null>(null)
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleActivate(id: string) {
    setConfirmingId(null)
    setActivatingId(id)
    setError(null)
    try {
      await activate(id).unwrap()
    } catch (err) {
      setError(extractErrorMessage(err, t('common.genericError')))
    } finally {
      setActivatingId(null)
    }
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 style={{ fontSize: '1rem', fontWeight: 600, color: colors.textPrimary, margin: 0 }}>
          {t('sysadmin.pendingApproval')}
        </h2>
        {pending.length > 0 && (
          <span className="badge" style={{ backgroundColor: colors.primaryLight, color: colors.primary, fontWeight: 600 }}>
            {pending.length}
          </span>
        )}
      </div>

      <FormError message={error} />

      {isLoading && <p style={{ color: colors.textSecondary, fontSize: '0.9rem' }}>{t('sysadmin.loading')}</p>}

      {!isLoading && pending.length === 0 && (
        <p style={{ color: colors.textSecondary, fontSize: '0.9rem', margin: 0 }}>
          {t('sysadmin.noPendingApproval')}
        </p>
      )}

      {pending.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {pending.map((p) => (
            <div
              key={p.id}
              className="rounded-3 p-3 d-flex justify-content-between align-items-center gap-3 flex-wrap"
              style={{ border: `1px solid ${colors.borderDefault}`, backgroundColor: colors.bgCard }}
            >
              <div style={{ minWidth: 0 }}>
                <p className="fw-semibold mb-0" style={{ color: colors.textPrimary, fontSize: '0.9rem' }}>{p.name}</p>
                <p className="mb-0" style={{ color: colors.textSecondary, fontSize: '0.8rem' }}>{p.address}</p>
                <p className="mb-0 mt-1" style={{ color: colors.textMuted, fontSize: '0.78rem' }}>
                  {p.adminName ?? t('sysadmin.unknown')}{p.adminEmail ? ` · ${p.adminEmail}` : ''} · {t('sysadmin.createdOn', { date: formatDateFull(p.createdAt.slice(0, 10)) })}
                </p>
              </div>
              {confirmingId === p.id ? (
                <span className="d-flex gap-2">
                  <button type="button" className="btn btn-primary btn-sm" onClick={() => handleActivate(p.id)}>
                    {t('sysadmin.confirmActivate')}
                  </button>
                  <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setConfirmingId(null)}>
                    {t('common.cancel')}
                  </button>
                </span>
              ) : (
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  disabled={activatingId === p.id}
                  onClick={() => setConfirmingId(p.id)}
                >
                  {activatingId === p.id ? t('sysadmin.activating') : t('sysadmin.activate')}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  )
}
