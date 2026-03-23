import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useMeQuery, UserRole } from '../../../features/auth/authApi'
import { useModal } from '../../../shared/modals/useModal'
import {
  useGetPropertyMembersQuery,
  useUpdateMemberMutation,
  useRemoveMemberMutation,
  useForcePasswordResetMutation,
  type PropertyMemberDto,
} from '../../../features/users/usersApi'

const roleLabel: Record<UserRole, string> = {
  [UserRole.Resident]: 'Beboer',
  [UserRole.ComplexAdmin]: 'Ejendomsadmin',
  [UserRole.OrgAdmin]: 'Organisationsadmin',
  [UserRole.SysAdmin]: 'Systemadmin',
}

const roleBadgeStyle: Record<UserRole, { bg: string; color: string }> = {
  [UserRole.Resident]:     { bg: '#f0f4f8', color: '#5a6a7a' },
  [UserRole.ComplexAdmin]: { bg: '#e8f0fe', color: '#1565c0' },
  [UserRole.OrgAdmin]:     { bg: '#e8f5e9', color: '#2e7d32' },
  [UserRole.SysAdmin]:     { bg: '#fce4ec', color: '#c62828' },
}

export function PropertyUsersPage() {
  const { propertyId } = useParams<{ propertyId: string }>()
  const { data: currentUser } = useMeQuery()
  const property = currentUser?.memberships.find((m) => m.propertyId === propertyId)
  const { openModal } = useModal()

  const { data: members = [], isLoading, isError } = useGetPropertyMembersQuery(propertyId!, {
    skip: !propertyId,
  })

  const [updateMember] = useUpdateMemberMutation()
  const [removeMember] = useRemoveMemberMutation()
  const [forcePasswordReset] = useForcePasswordResetMutation()

  // Track per-row UI state
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)
  const [resetSuccessId, setResetSuccessId] = useState<string | null>(null)

  async function handleToggleActive(member: PropertyMemberDto) {
    setActionLoadingId(member.userId)
    try {
      await updateMember({
        propertyId: propertyId!,
        userId: member.userId,
        apartmentNumber: member.apartmentNumber,
        role: member.role,
        isActive: !member.isActive,
      }).unwrap()
    } finally {
      setActionLoadingId(null)
    }
  }

  async function handleDelete(userId: string) {
    setActionLoadingId(userId)
    try {
      await removeMember({ propertyId: propertyId!, userId }).unwrap()
    } finally {
      setConfirmDeleteId(null)
      setActionLoadingId(null)
    }
  }

  async function handleForceReset(userId: string) {
    setActionLoadingId(userId)
    try {
      await forcePasswordReset({ propertyId: propertyId!, userId }).unwrap()
      setResetSuccessId(userId)
      setTimeout(() => setResetSuccessId(null), 3000)
    } finally {
      setActionLoadingId(null)
    }
  }

  return (
    <div className="p-4 p-lg-5">
      <div className="d-flex align-items-start justify-content-between mb-5 gap-3 flex-wrap">
        <div>
          <p className="mb-1" style={{ fontSize: '0.8rem', color: '#a0adb8', fontWeight: 500 }}>
            {property?.propertyName ?? 'Ejendom'}
          </p>
          <h1 className="fw-bold mb-0" style={{ fontSize: '1.6rem', color: '#0d1b2a' }}>Brugere</h1>
        </div>
        <button
          className="btn btn-primary btn-sm d-flex align-items-center gap-2"
          style={{ borderRadius: '8px', fontSize: '0.85rem' }}
          onClick={() => openModal('inviteUser', { propertyId: propertyId! })}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Inviter beboer
        </button>
      </div>

      <div className="bg-white rounded-3" style={{ border: '1px solid #e8ecf0', overflow: 'hidden' }}>
        {isLoading ? (
          <div className="d-flex justify-content-center align-items-center py-5">
            <div className="spinner-border text-primary spinner-border-sm" role="status" />
          </div>
        ) : isError ? (
          <div className="text-center py-5" style={{ color: '#dc3545', fontSize: '0.9rem' }}>
            Kunne ikke indlæse brugere.
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-5" style={{ color: '#a0adb8', fontSize: '0.9rem' }}>
            Ingen brugere endnu. Inviter den første beboer.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover mb-0" style={{ fontSize: '0.875rem' }}>
              <thead style={{ backgroundColor: '#f8fafb' }}>
                <tr>
                  <th className="border-0 px-4 py-3 fw-semibold" style={thStyle}>Navn</th>
                  <th className="border-0 px-4 py-3 fw-semibold d-none d-md-table-cell" style={thStyle}>Email</th>
                  <th className="border-0 px-4 py-3 fw-semibold" style={thStyle}>Lejlighed</th>
                  <th className="border-0 px-4 py-3 fw-semibold" style={thStyle}>Rolle</th>
                  <th className="border-0 px-4 py-3 fw-semibold" style={thStyle}>Status</th>
                  <th className="border-0 px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <MemberRow
                    key={m.userId}
                    member={m}
                    isSelf={m.userId === currentUser?.id}
                    isActionLoading={actionLoadingId === m.userId}
                    isConfirmingDelete={confirmDeleteId === m.userId}
                    showResetSuccess={resetSuccessId === m.userId}
                    onEdit={() => openModal('editMember', { propertyId: propertyId!, member: m })}
                    onToggleActive={() => handleToggleActive(m)}
                    onForceReset={() => handleForceReset(m.userId)}
                    onRequestDelete={() => setConfirmDeleteId(m.userId)}
                    onConfirmDelete={() => handleDelete(m.userId)}
                    onCancelDelete={() => setConfirmDeleteId(null)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="mt-3" style={{ fontSize: '0.78rem', color: '#a0adb8' }}>
        {members.length} bruger{members.length !== 1 ? 'e' : ''}
      </p>
    </div>
  )
}

// ── Row component ─────────────────────────────────────────────────────────────

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

function MemberRow({
  member, isSelf, isActionLoading, isConfirmingDelete, showResetSuccess,
  onEdit, onToggleActive, onForceReset, onRequestDelete, onConfirmDelete, onCancelDelete,
}: MemberRowProps) {
  const badge = roleBadgeStyle[member.role]
  const initials = [member.firstName, member.lastName]
    .filter(Boolean).map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    || member.email[0].toUpperCase()
  const displayName = [member.firstName, member.lastName].filter(Boolean).join(' ') || '—'

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
          {roleLabel[member.role]}
        </span>
      </td>
      <td className="px-4 py-3 align-middle">
        {member.isActive ? (
          <span style={{ color: '#2e7d32', fontSize: '0.78rem', fontWeight: 500 }}>Aktiv</span>
        ) : (
          <span style={{ color: '#a0adb8', fontSize: '0.78rem', fontWeight: 500 }}>Deaktiveret</span>
        )}
      </td>
      <td className="px-4 py-3 align-middle text-end" style={{ minWidth: 160 }}>
        {isConfirmingDelete ? (
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
        )}
      </td>
    </tr>
  )
}

const thStyle: React.CSSProperties = {
  color: '#5a6a7a',
  fontSize: '0.78rem',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
}
