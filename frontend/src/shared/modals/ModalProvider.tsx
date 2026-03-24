import { useAppSelector } from '../../app/hooks'
import { useModal } from './useModal'
import { LoginModal } from '../../features/auth/LoginModal'
import { InviteUserModal } from '../../features/users/InviteUserModal'
import { EditMemberModal } from '../../features/users/EditMemberModal'
import type { PropertyMemberDto } from '../../features/users/usersApi'

// ── Modal registry — add new modals here ─────────────────────────────────────

type ModalRegistry = {
  login: React.ComponentType<{ onClose: () => void }>
  inviteUser: React.ComponentType<{ propertyId: string; onClose: () => void }>
  editMember: React.ComponentType<{ propertyId: string; member: PropertyMemberDto; onClose: () => void }>
}

const MODALS: ModalRegistry = {
  login: LoginModal,
  inviteUser: InviteUserModal,
  editMember: EditMemberModal,
}

// ─────────────────────────────────────────────────────────────────────────────

export function ModalProvider() {
  const modal = useAppSelector((s) => s.modal)
  const { closeModal } = useModal()

  if (!modal) return null

  const name = modal.name as keyof ModalRegistry
  const Component = MODALS[name] as React.ComponentType<{ onClose: () => void } & Record<string, unknown>>
  if (!Component) return null

  return <Component onClose={closeModal} {...(modal.props as Record<string, unknown>)} />
}
