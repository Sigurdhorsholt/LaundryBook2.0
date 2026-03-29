import { useState } from 'react'
import { ROLE_LABEL } from '../../../shared/constants'
import { type PendingInviteDto } from '../../../features/users/usersApi'
import { colors } from '../../../shared/theme'

export interface PendingInviteRowProps {
  invite: PendingInviteDto
  isActionLoading: boolean
  showResendSuccess: boolean
  onResend: () => void
  onDelete: () => void
}

function PendingActions({ isActionLoading, showResendSuccess, onResend, onDelete }: Omit<PendingInviteRowProps, 'invite'>) {
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  if (showResendSuccess) {
    return <span style={{ fontSize: '0.78rem', color: colors.successText, fontWeight: 500 }}>Sendt ✓</span>
  }

  if (confirmingDelete) {
    return (
      <div className="d-flex align-items-center gap-2 flex-wrap">
        <span style={{ fontSize: '0.78rem', color: colors.textSecondary }}>Slet invitation?</span>
        <button
          className="btn btn-danger btn-sm"
          style={{ fontSize: '0.75rem', padding: '2px 10px' }}
          disabled={isActionLoading}
          onClick={onDelete}
        >
          {isActionLoading ? '…' : 'Ja'}
        </button>
        <button
          className="btn btn-outline-secondary btn-sm"
          style={{ fontSize: '0.75rem', padding: '2px 8px' }}
          onClick={() => setConfirmingDelete(false)}
        >
          Nej
        </button>
      </div>
    )
  }

  return (
    <div className="d-flex align-items-center gap-2 flex-wrap">
      <button
        className="btn btn-sm btn-outline-secondary"
        style={{ fontSize: '0.8rem', borderRadius: '6px', whiteSpace: 'nowrap' }}
        disabled={isActionLoading}
        onClick={onResend}
      >
        {isActionLoading ? '…' : 'Gensend'}
      </button>
      <button
        className="btn btn-sm"
        style={{ fontSize: '0.8rem', borderRadius: '6px', whiteSpace: 'nowrap', color: colors.dangerText, border: `1px solid ${colors.dangerBorder}`, backgroundColor: 'transparent' }}
        disabled={isActionLoading}
        onClick={() => setConfirmingDelete(true)}
      >
        Slet
      </button>
    </div>
  )
}

// ── Desktop table row ──────────────────────────────────────────────────────────

export function PendingInviteRow(props: PendingInviteRowProps) {
  const { invite } = props
  return (
    <tr style={{ opacity: 0.7 }}>
      <td className="px-4 py-3 align-middle">
        <div className="d-flex align-items-center gap-3">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 fw-semibold"
            style={{ width: 36, height: 36, backgroundColor: colors.bgSubtle, color: colors.textMuted, fontSize: '0.78rem' }}
          >
            ?
          </div>
          <span style={{ color: colors.textMuted, fontSize: '0.85rem', fontStyle: 'italic' }}>
            Ikke oprettet endnu
          </span>
        </div>
      </td>
      <td className="px-4 py-3 align-middle" style={{ color: colors.textSecondary }}>{invite.email}</td>
      <td className="px-4 py-3 align-middle" style={{ color: colors.textMuted }}>
        {invite.apartmentNumber ?? '—'}
      </td>
      <td className="px-4 py-3 align-middle">
        <span className="badge" style={{ backgroundColor: colors.bgSubtle, color: colors.textSecondary, fontWeight: 500, fontSize: '0.75rem' }}>
          {ROLE_LABEL[invite.role]}
        </span>
      </td>
      <td className="px-4 py-3 align-middle">
        <span style={{ color: colors.warningText, fontSize: '0.78rem', fontWeight: 500 }}>● Afventer</span>
      </td>
      <td className="px-4 py-3 align-middle text-end" style={{ whiteSpace: 'nowrap' }}>
        <PendingActions {...props} />
      </td>
    </tr>
  )
}

// ── Mobile card ────────────────────────────────────────────────────────────────

export function PendingInviteCard(props: PendingInviteRowProps) {
  const { invite } = props
  return (
    <div style={{ borderBottom: `1px solid ${colors.borderRow}`, padding: '12px 16px', opacity: 0.7 }}>
      <div className="d-flex align-items-start gap-3">
        <div
          className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 fw-semibold"
          style={{ width: 36, height: 36, backgroundColor: colors.bgSubtle, color: colors.textMuted, fontSize: '0.78rem' }}
        >
          ?
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="d-flex align-items-start justify-content-between gap-2">
            <div style={{ minWidth: 0 }}>
              <div style={{ color: colors.textMuted, fontSize: '0.85rem', fontStyle: 'italic' }}>
                Ikke oprettet endnu
              </div>
              <div className="text-truncate" style={{ fontSize: '0.78rem', color: colors.textSecondary, marginTop: 1 }}>
                {invite.email}
              </div>
            </div>
            <div className="flex-shrink-0">
              <PendingActions {...props} />
            </div>
          </div>
          <div className="d-flex align-items-center gap-2 flex-wrap mt-2">
            {invite.apartmentNumber && (
              <span style={{ fontSize: '0.75rem', color: colors.textMuted }}>
                Lejl. {invite.apartmentNumber}
              </span>
            )}
            <span className="badge" style={{ backgroundColor: colors.bgSubtle, color: colors.textSecondary, fontWeight: 500, fontSize: '0.72rem' }}>
              {ROLE_LABEL[invite.role]}
            </span>
            <span style={{ fontSize: '0.75rem', fontWeight: 500, color: colors.warningText }}>● Afventer</span>
          </div>
        </div>
      </div>
    </div>
  )
}
