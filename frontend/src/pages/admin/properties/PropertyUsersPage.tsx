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
  useDeleteInviteMutation,
  type PropertyMemberDto,
  type PendingInviteDto,
} from '../../../features/users/usersApi'
import { UserRow, UserCard } from './UserRow'
import { IconPlus } from '../../../shared/icons'
import { PageHeader, Spinner } from '../../../shared/ui'
import { colors } from '../../../shared/theme'

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
  const [deleteInvite] = useDeleteInviteMutation()

  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)
  const [resetSuccessId, setResetSuccessId] = useState<string | null>(null)
  const [resendSuccessId, setResendSuccessId] = useState<string | null>(null)

  const toggleMenu = (id: string) => setOpenMenuId((prev) => (prev === id ? null : id))
  const closeMenu = () => setOpenMenuId(null)

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

  async function handleDeleteInvite(inviteId: string) {
    setActionLoadingId(inviteId)
    try {
      await deleteInvite({ propertyId: propertyId!, inviteId }).unwrap()
    } finally {
      setActionLoadingId(null)
    }
  }

  function memberRowProps(m: PropertyMemberDto) {
    return {
      kind: 'member' as const,
      member: m,
      isSelf: m.userId === currentUser?.id,
      isActionLoading: actionLoadingId === m.userId,
      showResetSuccess: resetSuccessId === m.userId,
      isMenuOpen: openMenuId === m.userId,
      onMenuToggle: () => toggleMenu(m.userId),
      onMenuClose: closeMenu,
      onEdit: () => openModal('editMember', { propertyId: propertyId!, member: m }),
      onToggleActive: () => handleToggleActive(m),
      onForceReset: () => handleForceReset(m.userId),
      onDelete: () => handleDelete(m.userId),
    }
  }

  function inviteRowProps(invite: PendingInviteDto) {
    return {
      kind: 'invite' as const,
      invite,
      isActionLoading: actionLoadingId === invite.inviteId,
      showResendSuccess: resendSuccessId === invite.inviteId,
      isMenuOpen: openMenuId === invite.inviteId,
      onMenuToggle: () => toggleMenu(invite.inviteId),
      onMenuClose: closeMenu,
      onResend: () => handleResendInvite(invite.inviteId),
      onDelete: () => {
          console.log(11111)
          handleDeleteInvite(invite.inviteId)
      },
    }
  }

  const isEmpty = members.length === 0 && pendingInvites.length === 0
  const totalCount = members.length + pendingInvites.length
  const countLabel = `${totalCount} bruger${totalCount !== 1 ? 'e' : ''}${pendingInvites.length > 0 ? ` (${pendingInvites.length} afventer)` : ''}`

  let tableContent: React.ReactNode
  if (isLoading) {
    tableContent = <Spinner />
  } else if (isError) {
    tableContent = (
      <div className="text-center py-5" style={{ color: '#dc3545', fontSize: '0.9rem' }}>
        Kunne ikke indlæse brugere.
      </div>
    )
  } else if (isEmpty) {
    tableContent = (
      <div className="text-center py-5" style={{ color: colors.textMuted, fontSize: '0.9rem' }}>
        Ingen brugere endnu. Inviter den første beboer.
      </div>
    )
  } else {
    tableContent = (
      <>
        {/* ── Mobile: card list (hidden md+) ── */}
        <div className="d-md-none">
          {members.map((m) => <UserCard key={m.userId} {...memberRowProps(m)} />)}
          {pendingInvites.map((invite) => <UserCard key={invite.inviteId} {...inviteRowProps(invite)} />)}
        </div>

        {/* ── Desktop: table (hidden below md) ── */}
        <div className="d-none d-md-block table-responsive">
          <table className="table table-hover mb-0" style={{ fontSize: '0.875rem' }}>
            <thead style={{ backgroundColor: colors.bgPage }}>
              <tr>
                <th className="border-0 px-4 py-3 fw-semibold" style={{ ...thStyle, borderTopLeftRadius: '0.5rem' }}>Navn</th>
                <th className="border-0 px-4 py-3 fw-semibold" style={thStyle}>Email</th>
                <th className="border-0 px-4 py-3 fw-semibold" style={thStyle}>Lejlighed</th>
                <th className="border-0 px-4 py-3 fw-semibold" style={thStyle}>Rolle</th>
                <th className="border-0 px-4 py-3 fw-semibold" style={thStyle}>Status</th>
                <th className="border-0 px-4 py-3" style={{ borderTopRightRadius: '0.5rem' }} />
              </tr>
            </thead>
            <tbody>
              {members.map((m) => <UserRow key={m.userId} {...memberRowProps(m)} />)}
              {pendingInvites.map((invite) => <UserRow key={invite.inviteId} {...inviteRowProps(invite)} />)}
            </tbody>
          </table>
        </div>
      </>
    )
  }

  return (
    <div className="p-4 p-lg-5">
      <PageHeader
        eyebrow={property?.propertyName}
        title="Brugere"
        action={
          <button
            className="btn btn-primary btn-sm d-flex align-items-center gap-2"
            style={{ borderRadius: '8px', fontSize: '0.85rem' }}
            onClick={() => openModal('inviteUser', { propertyId: propertyId! })}
          >
            <IconPlus size={14} strokeWidth={2.5} />
            Inviter beboer
          </button>
        }
      />

      <div className="bg-white rounded-3" style={{ border: `1px solid ${colors.borderDefault}` }}>
        {tableContent}
      </div>

      <p className="mt-3" style={{ fontSize: '0.78rem', color: colors.textMuted }}>{countLabel}</p>
    </div>
  )
}

const thStyle: React.CSSProperties = {
  color: colors.textSecondary,
  fontSize: '0.78rem',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
}
