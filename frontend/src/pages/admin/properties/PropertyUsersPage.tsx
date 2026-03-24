import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useMeQuery } from '../../../features/auth/authApi'
import { useModal } from '../../../shared/modals/useModal'
import {
  useGetPropertyMembersQuery,
  useGetPendingInvitesQuery,
  useUpdateMemberMutation,
  useRemoveMemberMutation,
  useForcePasswordResetMutation,
  useResendInviteMutation,
  type PropertyMemberDto,
} from '../../../features/users/usersApi'
import { MemberRow } from './MemberRow'
import { PendingInviteRow } from './PendingInviteRow'
import { IconPlus } from '../../../shared/icons'

export function PropertyUsersPage() {
  const { propertyId } = useParams<{ propertyId: string }>()
  const { data: currentUser } = useMeQuery()
  const property = currentUser?.memberships.find((m) => m.propertyId === propertyId)
  const { openModal } = useModal()

  const { data: members = [], isLoading, isError } = useGetPropertyMembersQuery(propertyId!, {
    skip: !propertyId,
  })
  const { data: pendingInvites = [] } = useGetPendingInvitesQuery(propertyId!, {
    skip: !propertyId,
  })

  const [updateMember] = useUpdateMemberMutation()
  const [removeMember] = useRemoveMemberMutation()
  const [forcePasswordReset] = useForcePasswordResetMutation()
  const [resendInvite] = useResendInviteMutation()

  // Track per-row UI state
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)
  const [resetSuccessId, setResetSuccessId] = useState<string | null>(null)
  const [resendSuccessId, setResendSuccessId] = useState<string | null>(null)

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

  async function handleResendInvite(inviteId: string) {
    setActionLoadingId(inviteId)
    try {
      await resendInvite({ propertyId: propertyId!, inviteId }).unwrap()
      setResendSuccessId(inviteId)
      setTimeout(() => setResendSuccessId(null), 3000)
    } finally {
      setActionLoadingId(null)
    }
  }

  const isEmpty = members.length === 0 && pendingInvites.length === 0
  const totalCount = members.length + pendingInvites.length
  const countLabel = `${totalCount} bruger${totalCount !== 1 ? 'e' : ''}${pendingInvites.length > 0 ? ` (${pendingInvites.length} afventer)` : ''}`

  let tableContent: React.ReactNode
  if (isLoading) {
    tableContent = (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-primary spinner-border-sm" role="status" />
      </div>
    )
  } else if (isError) {
    tableContent = (
      <div className="text-center py-5" style={{ color: '#dc3545', fontSize: '0.9rem' }}>
        Kunne ikke indlæse brugere.
      </div>
    )
  } else if (isEmpty) {
    tableContent = (
      <div className="text-center py-5" style={{ color: '#a0adb8', fontSize: '0.9rem' }}>
        Ingen brugere endnu. Inviter den første beboer.
      </div>
    )
  } else {
    tableContent = (
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
            {pendingInvites.map((invite) => (
              <PendingInviteRow
                key={invite.inviteId}
                invite={invite}
                isActionLoading={actionLoadingId === invite.inviteId}
                showResendSuccess={resendSuccessId === invite.inviteId}
                onResend={() => handleResendInvite(invite.inviteId)}
              />
            ))}
          </tbody>
        </table>
      </div>
    )
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
          <IconPlus size={14} strokeWidth={2.5} />
          Inviter beboer
        </button>
      </div>

      <div className="bg-white rounded-3" style={{ border: '1px solid #e8ecf0', overflow: 'hidden' }}>
        {tableContent}
      </div>

      <p className="mt-3" style={{ fontSize: '0.78rem', color: '#a0adb8' }}>{countLabel}</p>
    </div>
  )
}

const thStyle: React.CSSProperties = {
  color: '#5a6a7a',
  fontSize: '0.78rem',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
}
