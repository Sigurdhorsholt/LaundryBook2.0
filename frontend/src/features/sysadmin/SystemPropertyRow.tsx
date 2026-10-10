import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useActivatePropertyMutation, useDeactivatePropertyMutation, type SystemPropertyDto } from './sysAdminApi'
import { SYSTEM_TABLE_CELL as cell } from './constants'
import { colors } from '../../shared/theme'
import { formatDateFull } from '../../shared/utils/dateUtils'
import { extractErrorMessage } from '../../shared/utils/errorUtils'

interface Props {
  property: SystemPropertyDto
  onInviteAdmin: (propertyId: string) => void
}

const num: React.CSSProperties = { ...cell, textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: colors.textPrimary }

export function SystemPropertyRow({ property: p, onInviteAdmin }: Props) {
  const { t } = useTranslation()
  const [activate, { isLoading: activating }] = useActivatePropertyMutation()
  const [deactivate, { isLoading: deactivating }] = useDeactivatePropertyMutation()
  const [confirmingDeactivate, setConfirmingDeactivate] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const busy = activating || deactivating

  async function run(action: () => Promise<unknown>) {
    setError(null)
    try {
      await action()
      setConfirmingDeactivate(false)
    } catch (err) {
      setError(extractErrorMessage(err, t('common.genericError')))
    }
  }

  return (
    <>
      <tr>
        <td style={cell}>
          <div className="fw-semibold" style={{ color: colors.textPrimary }}>{p.name}</div>
          <div style={{ fontSize: '0.78rem', color: colors.textSecondary }}>{p.address}</div>
        </td>
        <td style={cell}>
          <span
            className="badge"
            style={p.isActive
              ? { backgroundColor: colors.primaryLight, color: colors.primaryMutedText }
              : { backgroundColor: colors.slotWarningBg, color: colors.slotWarningText }}
          >
            {p.isActive ? t('sysadmin.active') : t('sysadmin.inactive')}
          </span>
        </td>
        <td style={{ ...cell, color: colors.textSecondary, whiteSpace: 'nowrap' }}>{formatDateFull(p.createdAt.slice(0, 10))}</td>
        <td style={num}>{t('sysadmin.allProperties.membersValue', { members: p.members, admins: p.admins })}</td>
        <td style={num}>{p.rooms}</td>
        <td style={num}>{p.bookingsLast30Days}</td>
        <td style={num}>{p.bookingsNext7Days}</td>
        <td style={{ ...cell, whiteSpace: 'nowrap', textAlign: 'right' }}>
          <span className="d-inline-flex gap-2">
            <Link to={`/admin/properties/${p.id}`} className="btn btn-sm btn-outline-primary">{t('sysadmin.allProperties.open')}</Link>
            <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => onInviteAdmin(p.id)}>{t('properties.inviteAdmin')}</button>
            {p.isActive ? (
              <button type="button" className="btn btn-sm btn-outline-danger" disabled={busy} onClick={() => setConfirmingDeactivate(true)}>
                {t('sysadmin.allProperties.deactivate')}
              </button>
            ) : (
              <button type="button" className="btn btn-sm btn-primary" disabled={busy} onClick={() => run(() => activate(p.id).unwrap())}>
                {activating ? t('sysadmin.activating') : t('sysadmin.activate')}
              </button>
            )}
          </span>
        </td>
      </tr>
      {(confirmingDeactivate || error) && (
        <tr>
          <td colSpan={8} style={{ padding: '0 12px 12px', fontSize: '0.85rem' }}>
            {error && <p className="mb-2" role="alert" style={{ color: colors.dangerText }}>{error}</p>}
            {confirmingDeactivate && (
              <div className="d-flex flex-wrap align-items-center gap-2 rounded-2 p-2" style={{ backgroundColor: colors.dangerBg, border: `1px solid ${colors.dangerBorder}` }}>
                <span style={{ flex: '1 1 320px', color: colors.textPrimary }}>{t('sysadmin.allProperties.deactivateHint', { property: p.name })}</span>
                <button type="button" className="btn btn-sm btn-danger" disabled={busy} onClick={() => run(() => deactivate(p.id).unwrap())}>
                  {t('sysadmin.allProperties.confirmDeactivate')}
                </button>
                <button type="button" className="btn btn-sm btn-outline-secondary" disabled={busy} onClick={() => setConfirmingDeactivate(false)}>
                  {t('common.cancel')}
                </button>
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  )
}
