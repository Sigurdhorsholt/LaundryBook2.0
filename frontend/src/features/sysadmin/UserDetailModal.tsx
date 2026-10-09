import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ModalShell } from '../../shared/modals/ModalShell'
import { useGetUserWithMembershipsQuery, useAssignUserToPropertyMutation } from './sysAdminApi'
import type { SysAdminUserDto } from './sysAdminApi'
import { UserDetailSummary } from './UserDetailSummary'
import { UserMembershipRow } from './UserMembershipRow'
import { DeleteUserSection } from './DeleteUserSection'
import { useUpdateMemberMutation, useRemoveMemberMutation } from '../users/usersApi'
import { useGetMyPropertiesQuery } from '../properties/propertiesApi'
import { useAllMemberRoleOptions } from '../../shared/constants'
import { UserRole } from '../auth/authApi'
import { colors } from '../../shared/theme'
import { extractErrorMessage } from '../../shared/utils/errorUtils'
import { FormError } from '../../shared/ui'

interface Props {
  user: SysAdminUserDto
  onClose: () => void
}

const sectionLabel: React.CSSProperties = { fontSize: '0.8rem', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }

// One user on /system: the facts, loaded only when opened, plus memberships and deletion
export function UserDetailModal({ user, onClose }: Props) {
  const { t } = useTranslation()
  const roleOptions = useAllMemberRoleOptions()
  const { data: detail, isLoading } = useGetUserWithMembershipsQuery(user.id)
  // For a SysAdmin this is every property on the platform
  const { data: allProperties = [] } = useGetMyPropertiesQuery()
  const [updateMember] = useUpdateMemberMutation()
  const [removeMember] = useRemoveMemberMutation()
  const [assignToProperty] = useAssignUserToPropertyMutation()
  const [error, setError] = useState<string | null>(null)
  const [addPropertyId, setAddPropertyId] = useState('')
  const [addRole, setAddRole] = useState<UserRole>(UserRole.ComplexAdmin)

  const memberPropertyIds = new Set(detail?.memberships.map((m) => m.propertyId) ?? [])
  const availableProperties = allProperties.filter((p) => !memberPropertyIds.has(p.id))

  // Failures such as removing the last admin must show, not vanish
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

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!addPropertyId) return
    if (!await run(() => assignToProperty({ userId: user.id, propertyId: addPropertyId, role: addRole, apartmentNumber: null }).unwrap())) return
    setAddPropertyId('')
    setAddRole(UserRole.ComplexAdmin)
  }

  return (
    <ModalShell title={`${user.firstName} ${user.lastName}`.trim() || user.email} onClose={onClose} size="lg">
      <p className="mb-3" style={{ color: colors.textSecondary, fontSize: '0.875rem', overflowWrap: 'anywhere' }}>{user.email}</p>

      {isLoading && <p style={{ color: colors.textSecondary, fontSize: '0.9rem' }}>{t('sysadmin.loading')}</p>}
      {detail && <UserDetailSummary detail={detail} />}

      <p className="fw-semibold mb-2" style={sectionLabel}>{t('sysadmin.currentProperties')}</p>
      <FormError message={error} />
      {detail?.memberships.length === 0 && (
        <p style={{ color: colors.textSecondary, fontSize: '0.9rem', marginBottom: 16 }}>{t('sysadmin.noProperties')}</p>
      )}
      {detail?.memberships.map((m) => (
        <UserMembershipRow
          key={m.propertyId}
          membership={m}
          onChange={(role, isActive) => run(() => updateMember({ propertyId: m.propertyId, userId: user.id, role, apartmentNumber: m.apartmentNumber, isActive }).unwrap())}
          onRemove={() => run(() => removeMember({ propertyId: m.propertyId, userId: user.id }).unwrap())}
        />
      ))}

      {availableProperties.length > 0 && (
        <>
          <p className="fw-semibold mt-4 mb-2" style={sectionLabel}>{t('sysadmin.addToProperty')}</p>
          <form onSubmit={handleAdd} className="d-flex flex-wrap gap-2 align-items-end">
            <select className="form-select form-select-sm" style={{ flex: '2 1 200px' }} value={addPropertyId} onChange={(e) => setAddPropertyId(e.target.value)} required>
              <option value="">{t('sysadmin.selectProperty')}</option>
              {availableProperties.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <select className="form-select form-select-sm" style={{ flex: '1 1 140px' }} value={addRole} onChange={(e) => setAddRole(Number(e.target.value) as UserRole)}>
              {roleOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <button type="submit" className="btn btn-primary btn-sm">{t('sysadmin.add')}</button>
          </form>
        </>
      )}

      {detail && <DeleteUserSection userId={user.id} email={detail.email} onDeleted={onClose} />}
    </ModalShell>
  )
}
