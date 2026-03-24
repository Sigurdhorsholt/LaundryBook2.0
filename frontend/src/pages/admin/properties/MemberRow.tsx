import { ROLE_LABEL, ROLE_BADGE_STYLE } from '../../../shared/constants'
import { type PropertyMemberDto } from '../../../features/users/usersApi'

interface MemberRowProps {
  member: PropertyMemberDto
  isSelf: boolean
  isActionLoading: boolean
  isConfirmingDelete: boolean
  showResetSuccess: boolean
  onEdit: () => void
  onToggleActive: () => void
  onForceReset: () => void
  onRequestDelete: () => void
  onConfirmDelete: () => void
  onCancelDelete: () => void
}

export function MemberRow({
  member, isSelf, isActionLoading, isConfirmingDelete, showResetSuccess,
  onEdit, onToggleActive, onForceReset, onRequestDelete, onConfirmDelete, onCancelDelete,
}: MemberRowProps) {
  const badge = ROLE_BADGE_STYLE[member.role]

  const initials = [member.firstName, member.lastName]
    .filter(Boolean).map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    || member.email[0].toUpperCase()

  const displayName = [member.firstName, member.lastName].filter(Boolean).join(' ') || '—'

  const rowActions = isConfirmingDelete ? (
    <div className="d-flex align-items-center justify-content-end gap-2">
      <span style={{ fontSize: '0.78rem', color: '#5a6a7a' }}>Slet bruger?</span>
      <button
        className="btn btn-danger btn-sm"
        style={{ fontSize: '0.75rem', padding: '2px 10px' }}
        disabled={isActionLoading}
        onClick={onConfirmDelete}
      >
        {isActionLoading ? '…' : 'Ja'}
      </button>
      <button
        className="btn btn-outline-secondary btn-sm"
        style={{ fontSize: '0.75rem', padding: '2px 8px' }}
        onClick={onCancelDelete}
      >
        Nej
      </button>
    </div>
  ) : showResetSuccess ? (
    <span style={{ fontSize: '0.78rem', color: '#2e7d32', fontWeight: 500 }}>Email sendt ✓</span>
  ) : (
    <div className="btn-group">
      <button
        className="btn btn-sm btn-outline-secondary"
        style={{ fontSize: '0.8rem', borderRadius: '6px 0 0 6px' }}
        onClick={onEdit}
        title="Rediger"
      >
        Rediger
      </button>
      <button
        type="button"
        className="btn btn-sm btn-outline-secondary dropdown-toggle dropdown-toggle-split"
        style={{ borderRadius: '0 6px 6px 0' }}
        data-bs-toggle="dropdown"
        aria-expanded="false"
        aria-label="Flere handlinger"
      />
      <ul className="dropdown-menu dropdown-menu-end" style={{ fontSize: '0.85rem', minWidth: 200 }}>
        <li>
          <button
            className="dropdown-item"
            disabled={isActionLoading || isSelf}
            onClick={onToggleActive}
          >
            {member.isActive ? 'Deaktiver adgang' : 'Aktiver adgang'}
          </button>
        </li>
        <li>
          <button
            className="dropdown-item"
            disabled={isActionLoading}
            onClick={onForceReset}
          >
            Tving passwordskift
          </button>
        </li>
        <li><hr className="dropdown-divider" /></li>
        <li>
          <button
            className="dropdown-item text-danger"
            disabled={isActionLoading || isSelf}
            onClick={onRequestDelete}
          >
            Fjern fra ejendom
          </button>
        </li>
      </ul>
    </div>
  )

  return (
    <tr style={{ opacity: member.isActive ? 1 : 0.55 }}>
      <td className="px-4 py-3 align-middle">
        <div className="d-flex align-items-center gap-3">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 fw-semibold"
            style={{ width: 32, height: 32, backgroundColor: '#e8f0fe', color: '#1565c0', fontSize: '0.78rem' }}
          >
            {initials}
          </div>
          <span className="fw-medium" style={{ color: '#0d1b2a' }}>{displayName}</span>
        </div>
      </td>
      <td className="px-4 py-3 align-middle d-none d-md-table-cell" style={{ color: '#5a6a7a' }}>
        {member.email}
      </td>
      <td className="px-4 py-3 align-middle" style={{ color: '#0d1b2a' }}>
        {member.apartmentNumber ?? <span style={{ color: '#a0adb8' }}>—</span>}
      </td>
      <td className="px-4 py-3 align-middle">
        <span className="badge" style={{ backgroundColor: badge.bg, color: badge.color, fontWeight: 500, fontSize: '0.75rem' }}>
          {ROLE_LABEL[member.role]}
        </span>
      </td>
      <td className="px-4 py-3 align-middle">
        {member.isActive
          ? <span style={{ color: '#2e7d32', fontSize: '0.78rem', fontWeight: 500 }}>Aktiv</span>
          : <span style={{ color: '#a0adb8', fontSize: '0.78rem', fontWeight: 500 }}>Deaktiveret</span>
        }
      </td>
      <td className="px-4 py-3 align-middle text-end" style={{ minWidth: 160 }}>
        {rowActions}
      </td>
    </tr>
  )
}
