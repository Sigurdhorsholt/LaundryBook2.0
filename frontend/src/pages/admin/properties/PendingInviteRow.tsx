import { ROLE_LABEL } from '../../../shared/constants'
import { type PendingInviteDto } from '../../../features/users/usersApi'

interface PendingInviteRowProps {
  invite: PendingInviteDto
  isActionLoading: boolean
  showResendSuccess: boolean
  onResend: () => void
}

export function PendingInviteRow({ invite, isActionLoading, showResendSuccess, onResend }: PendingInviteRowProps) {
  const actionCell = showResendSuccess ? (
    <span style={{ fontSize: '0.78rem', color: '#2e7d32', fontWeight: 500 }}>Sendt ✓</span>
  ) : (
    <button
      className="btn btn-sm btn-outline-secondary"
      style={{ fontSize: '0.8rem', borderRadius: '6px' }}
      disabled={isActionLoading}
      onClick={onResend}
    >
      {isActionLoading ? '…' : 'Gensend invitation'}
    </button>
  )

  return (
    <tr style={{ opacity: 0.7 }}>
      <td className="px-4 py-3 align-middle">
        <div className="d-flex align-items-center gap-3">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 fw-semibold"
            style={{ width: 32, height: 32, backgroundColor: '#f0f4f8', color: '#a0adb8', fontSize: '0.78rem' }}
          >
            ?
          </div>
          <span style={{ color: '#a0adb8', fontSize: '0.85rem', fontStyle: 'italic' }}>Ikke oprettet endnu</span>
        </div>
      </td>
      <td className="px-4 py-3 align-middle d-none d-md-table-cell" style={{ color: '#5a6a7a' }}>
        {invite.email}
      </td>
      <td className="px-4 py-3 align-middle" style={{ color: '#a0adb8' }}>
        {invite.apartmentNumber ?? '—'}
      </td>
      <td className="px-4 py-3 align-middle">
        <span className="badge" style={{ backgroundColor: '#f0f4f8', color: '#5a6a7a', fontWeight: 500, fontSize: '0.75rem' }}>
          {ROLE_LABEL[invite.role]}
        </span>
      </td>
      <td className="px-4 py-3 align-middle">
        <span style={{ color: '#e6a817', fontSize: '0.78rem', fontWeight: 500 }}>Afventer</span>
      </td>
      <td className="px-4 py-3 align-middle text-end" style={{ minWidth: 160 }}>
        {actionCell}
      </td>
    </tr>
  )
}
