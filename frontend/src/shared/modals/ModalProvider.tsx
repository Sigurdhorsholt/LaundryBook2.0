import { useAppSelector } from '../../app/hooks'
import { useModal } from './useModal'
import { LoginModal } from '../../features/auth/LoginModal'
import { InviteUserModal } from '../../features/users/InviteUserModal'
import { EditMemberModal } from '../../features/users/EditMemberModal'

// ── Register modals here ─────────────────────────────────────────────────────
// Add new entries as: 'modal-name': ComponentWithOnCloseProp
const MODALS: Record<string, React.ComponentType<any>> = {
  login: LoginModal,
  inviteUser: InviteUserModal,
  editMember: EditMemberModal,
}
// ─────────────────────────────────────────────────────────────────────────────

export function ModalProvider() {
  const modal = useAppSelector((s) => s.modal)
  const { closeModal } = useModal()

  if (!modal) return null

  const Component = MODALS[modal.name]
  if (!Component) return null

  return <Component onClose={closeModal} {...(modal.props as object)} />
}
