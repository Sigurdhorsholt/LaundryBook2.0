import { ROLE_LABEL, ROLE_BADGE_STYLE } from '../../../shared/constants'
import { type PropertyMemberDto } from '../../../features/users/usersApi'

export interface MemberRowProps {
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

function Avatar({ initials }: { initials: string }) {
  return (
    <div
      className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 fw-semibold"
      style={{ width: 36, height: 36, backgroundColor: '#e8f0fe', color: '#1565c0', fontSize: '0.78rem' }}
    >
      {initials}
    </div>
  )
}

function Actions({
  member, isSelf, isActionLoading, isConfirmingDelete, showResetSuccess,
  onEdit, onToggleActive, onForceReset, onRequestDelete, onConfirmDelete, onCancelDelete,
}: MemberRowProps) {
  if (isConfirmingDelete) {
    return (
      <div className="d-flex align-items-center gap-2 flex-wrap">
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
    )
  }

  if (showResetSuccess) {
    return <span style={{ fontSize: '0.78rem', color: '#2e7d32', fontWeight: 500 }}>Email sendt ✓</span>
  }

  return (
    <div className="btn-group">
      <button
        className="btn btn-sm btn-outline-secondary"
        style={{ fontSize: '0.8rem', borderRadius: '6px 0 0 6px' }}
        onClick={onEdit}
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
          <button className="dropdown-item" disabled={isActionLoading || isSelf} onClick={onToggleActive}>
            {member.isActive ? 'Deaktiver adgang' : 'Aktiver adgang'}
          </button>
        </li>
        <li>
          <button className="dropdown-item" disabled={isActionLoading} onClick={onForceReset}>
            Tving passwordskift
          </button>
        </li>
        <li><hr className="dropdown-divider" /></li>
        <li>
          <button className="dropdown-item text-danger" disabled={isActionLoading || isSelf} onClick={onRequestDelete}>
            Fjern fra ejendom
          </button>
        </li>
      </ul>
    </div>
  )
}

// ── Desktop table row ──────────────────────────────────────────────────────────

export function MemberRow(props: MemberRowProps) {
  const { member } = props
  const badge = ROLE_BADGE_STYLE[member.role]
  const initials = [member.firstName, member.lastName]
    .filter(Boolean).map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    || member.email[0].toUpperCase()
  const displayName = [member.firstName, member.lastName].filter(Boolean).join(' ') || '—'

  return (
    <tr style={{ opacity: member.isActive ? 1 : 0.55 }}>
      <td className="px-4 py-3 align-middle">
        <div className="d-flex align-items-center gap-3">
          <Avatar initials={initials} />
          <span className="fw-medium" style={{ color: '#0d1b2a' }}>{displayName}</span>
        </div>
      </td>
      <td className="px-4 py-3 align-middle" style={{ color: '#5a6a7a' }}>{member.email}</td>
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
          ? <span style={{ color: '#2e7d32', fontSize: '0.78rem', fontWeight: 500 }}>● Aktiv</span>
          : <span style={{ color: '#a0adb8', fontSize: '0.78rem', fontWeight: 500 }}>● Deaktiveret</span>
        }
      </td>
      <td className="px-4 py-3 align-middle text-end" style={{ whiteSpace: 'nowrap' }}>
        <Actions {...props} />
      </td>
    </tr>
  )
}

// ── Mobile card ────────────────────────────────────────────────────────────────

export function MemberCard(props: MemberRowProps) {
  const { member } = props
  const badge = ROLE_BADGE_STYLE[member.role]
  const initials = [member.firstName, member.lastName]
    .filter(Boolean).map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    || member.email[0].toUpperCase()
  const displayName = [member.firstName, member.lastName].filter(Boolean).join(' ') || '—'

  return (
    <div
      style={{
        borderBottom: '1px solid #f0f4f8',
        padding: '12px 16px',
        opacity: member.isActive ? 1 : 0.55,
      }}
    >
      <div className="d-flex align-items-start gap-3">
        <Avatar initials={initials} />
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Top row: name + actions */}
          <div className="d-flex align-items-start justify-content-between gap-2">
            <div style={{ minWidth: 0 }}>
              <div className="fw-medium text-truncate" style={{ color: '#0d1b2a', fontSize: '0.9rem' }}>
                {displayName}
              </div>
              <div className="text-truncate" style={{ fontSize: '0.78rem', color: '#5a6a7a', marginTop: 1 }}>
                {member.email}
              </div>
            </div>
            <div className="flex-shrink-0">
              <Actions {...props} />
            </div>
          </div>
          {/* Bottom row: apartment + role badge + status */}
          <div className="d-flex align-items-center gap-2 flex-wrap mt-2">
            {member.apartmentNumber && (
              <span style={{ fontSize: '0.75rem', color: '#a0adb8' }}>
                Lejl. {member.apartmentNumber}
              </span>
            )}
            <span
              className="badge"
              style={{ backgroundColor: badge.bg, color: badge.color, fontWeight: 500, fontSize: '0.72rem' }}
            >
              {ROLE_LABEL[member.role]}
            </span>
            <span style={{
              fontSize: '0.75rem', fontWeight: 500,
              color: member.isActive ? '#2e7d32' : '#a0adb8',
            }}>
              {member.isActive ? '● Aktiv' : '● Deaktiveret'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
