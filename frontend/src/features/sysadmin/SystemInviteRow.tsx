import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { SystemInviteDto, SystemInviteStatus } from './sysAdminApi'
import { useDeleteInviteMutation, useResendInviteMutation, useRevokeOpenInviteLinkMutation } from '../users/usersApi'
import { SYSTEM_TABLE_CELL as cell } from './constants'
import { ROLE_BADGE_STYLE, useRoleLabel } from '../../shared/constants'
import { colors } from '../../shared/theme'
import { formatTimestampDate } from '../../shared/utils/dateUtils'
import { extractErrorMessage } from '../../shared/utils/errorUtils'

interface Props {
  invite: SystemInviteDto
  status: SystemInviteStatus
  onResent: (email: string) => void
}

const muted: React.CSSProperties = { ...cell, color: colors.textSecondary, whiteSpace: 'nowrap' }

export function SystemInviteRow({ invite: i, status, onResent }: Props) {
  const { t } = useTranslation()
  const roleLabel = useRoleLabel()
  const [resend, { isLoading: resending }] = useResendInviteMutation()
  const [deleteInvite, { isLoading: deleting }] = useDeleteInviteMutation()
  const [revokeLink, { isLoading: revoking }] = useRevokeOpenInviteLinkMutation()
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const busy = resending || deleting || revoking
  const recipient = i.email ?? (i.isMultiUse ? t('sysadmin.invites.sharedLink') : t('sysadmin.invites.personalLink'))
  const isExpired = status === 'Expired'

  async function run(action: () => Promise<unknown>) {
    setError(null)
    try {
      await action()
      return true
    } catch (err) {
      setError(extractErrorMessage(err, t('common.genericError')))
      return false
    }
  }

  async function handleResend() {
    if (await run(() => resend({ propertyId: i.propertyId, inviteId: i.id }).unwrap())) onResent(i.email!)
  }

  async function handleRemove() {
    // The shared link uses the property's own revoke, which expires it rather than deleting the row
    const removed = await run(() => i.isMultiUse
      ? revokeLink(i.propertyId).unwrap()
      : deleteInvite({ propertyId: i.propertyId, inviteId: i.id }).unwrap())
    if (removed) setConfirming(false)
  }

  const hint = i.isMultiUse
    ? t('users.revokeWarning')
    : i.email
      ? t(isExpired ? 'sysadmin.invites.deleteHint' : 'sysadmin.invites.revokeHint', { email: i.email })
      : t(isExpired ? 'sysadmin.invites.deleteLinkHint' : 'sysadmin.invites.revokeLinkHint')

  return (
    <>
      <tr>
        <td style={{ ...cell, overflowWrap: 'anywhere' }}>
          <div className="fw-semibold" style={{ color: colors.textPrimary }}>{recipient}</div>
          {i.apartmentNumber && (
            <div style={{ fontSize: '0.78rem', color: colors.textSecondary }}>{t('laundry.apartmentShort', { number: i.apartmentNumber })}</div>
          )}
        </td>
        <td style={cell}>
          <Link to={`/admin/properties/${i.propertyId}/users`} style={{ color: colors.textPrimary }}>{i.propertyName}</Link>
        </td>
        <td style={cell}>
          <span className="badge" style={{ backgroundColor: ROLE_BADGE_STYLE[i.role].bg, color: ROLE_BADGE_STYLE[i.role].color }}>
            {roleLabel(i.role)}
          </span>
        </td>
        <td style={{ ...cell, color: i.createdBy ? colors.textPrimary : colors.textMuted }}>{i.createdBy ?? t('sysadmin.unknown')}</td>
        <td style={muted}>{formatTimestampDate(i.createdAt)}</td>
        <td style={muted}>{formatTimestampDate(i.expiresAt)}</td>
        <td style={{ ...cell, whiteSpace: 'nowrap', textAlign: 'right' }}>
          <span className="d-inline-flex gap-2">
            {i.email && (
              <button type="button" className="btn btn-sm btn-outline-primary" disabled={busy} onClick={handleResend}>
                {resending ? t('sysadmin.invites.resending') : t('sysadmin.invites.resend')}
              </button>
            )}
            <button type="button" className="btn btn-sm btn-outline-danger" disabled={busy} onClick={() => setConfirming(true)}>
              {isExpired ? t('sysadmin.invites.delete') : t('sysadmin.invites.revoke')}
            </button>
          </span>
        </td>
      </tr>
      {(confirming || error) && (
        <tr>
          <td colSpan={7} style={{ padding: '0 12px 12px', fontSize: '0.85rem' }}>
            {error && <p className="mb-2" role="alert" style={{ color: colors.dangerText }}>{error}</p>}
            {confirming && (
              <div className="d-flex flex-wrap align-items-center gap-2 rounded-2 p-2" style={{ backgroundColor: colors.dangerBg, border: `1px solid ${colors.dangerBorder}` }}>
                <span style={{ flex: '1 1 320px', color: colors.textPrimary }}>{hint}</span>
                <button type="button" className="btn btn-sm btn-danger" disabled={busy} onClick={handleRemove}>
                  {isExpired ? t('sysadmin.invites.confirmDelete') : t('sysadmin.invites.confirmRevoke')}
                </button>
                <button type="button" className="btn btn-sm btn-outline-secondary" disabled={busy} onClick={() => setConfirming(false)}>
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
