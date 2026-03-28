import { useState } from 'react'
import { ModalShell } from '../../shared/modals/ModalShell'
import { useGetUserWithMembershipsQuery, useAssignUserToPropertyMutation } from './sysAdminApi'
import type { SysAdminUserDto } from './sysAdminApi'
import { useUpdateMemberMutation, useRemoveMemberMutation } from '../users/usersApi'
import { useGetMyPropertiesQuery } from '../properties/propertiesApi'
import { ALL_MEMBER_ROLE_OPTIONS } from '../../shared/constants'
import { UserRole } from '../auth/authApi'
import { colors } from '../../shared/theme'

interface ManageUserMembershipsModalProps {
  user: SysAdminUserDto
  onClose: () => void
}

export function ManageUserMembershipsModal({ user, onClose }: ManageUserMembershipsModalProps) {
  const { data: detail, isLoading } = useGetUserWithMembershipsQuery(user.id)
  const { data: allProperties = [] } = useGetMyPropertiesQuery()
  const [updateMember] = useUpdateMemberMutation()
  const [removeMember] = useRemoveMemberMutation()
  const [assignToProperty] = useAssignUserToPropertyMutation()

  const [addPropertyId, setAddPropertyId] = useState('')
  const [addRole, setAddRole] = useState<UserRole>(UserRole.ComplexAdmin)

  const memberPropertyIds = new Set(detail?.memberships.map((m) => m.propertyId) ?? [])
  const availableProperties = allProperties.filter((p) => !memberPropertyIds.has(p.id))

  async function handleRoleChange(propertyId: string, role: UserRole, apartmentNumber: string | null, isActive: boolean) {
    await updateMember({ propertyId, userId: user.id, role, apartmentNumber, isActive })
  }

  async function handleToggleActive(propertyId: string, role: UserRole, apartmentNumber: string | null, isActive: boolean) {
    await updateMember({ propertyId, userId: user.id, role, apartmentNumber, isActive: !isActive })
  }

  async function handleRemove(propertyId: string) {
    await removeMember({ propertyId, userId: user.id })
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!addPropertyId) return
    await assignToProperty({ userId: user.id, propertyId: addPropertyId, role: addRole, apartmentNumber: null })
    setAddPropertyId('')
    setAddRole(UserRole.ComplexAdmin)
  }

  return (
    <ModalShell title="Administrer adgang" onClose={onClose} size="lg">
      <p className="mb-4" style={{ color: colors.textSecondary, fontSize: '0.875rem' }}>
        <strong style={{ color: colors.textPrimary }}>{user.firstName} {user.lastName}</strong> · {user.email}
      </p>

      <p className="fw-semibold mb-2" style={{ fontSize: '0.8rem', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Nuværende ejendomme
      </p>

      {isLoading && <p style={{ color: colors.textSecondary, fontSize: '0.9rem' }}>Henter...</p>}

      {!isLoading && detail?.memberships.length === 0 && (
        <p style={{ color: colors.textSecondary, fontSize: '0.9rem', marginBottom: 16 }}>Ingen ejendomme.</p>
      )}

      {detail?.memberships.map((m) => (
        <div
          key={m.propertyId}
          className="d-flex align-items-center gap-2 mb-2 p-2 rounded-2"
          style={{ border: `1px solid ${colors.borderDefault}`, backgroundColor: colors.bgSubtle }}
        >
          <span style={{ flex: 1, fontWeight: 500, fontSize: '0.875rem', color: colors.textPrimary }}>{m.propertyName}</span>

          <select
            className="form-select form-select-sm"
            style={{ width: 'auto' }}
            value={m.role}
            onChange={(e) => handleRoleChange(m.propertyId, Number(e.target.value) as UserRole, m.apartmentNumber, m.isActive)}
          >
            {ALL_MEMBER_ROLE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          <button
            type="button"
            className="btn btn-sm"
            style={{
              fontSize: '0.78rem',
              backgroundColor: m.isActive ? colors.successBg : colors.bgMuted,
              color: m.isActive ? colors.successText : colors.textMuted,
              border: `1px solid ${m.isActive ? colors.successBorder : colors.borderDefault}`,
            }}
            onClick={() => handleToggleActive(m.propertyId, m.role, m.apartmentNumber, m.isActive)}
          >
            {m.isActive ? 'Aktiv' : 'Inaktiv'}
          </button>

          <button
            type="button"
            className="btn btn-sm btn-outline-danger"
            onClick={() => handleRemove(m.propertyId)}
          >
            Fjern
          </button>
        </div>
      ))}

      {availableProperties.length > 0 && (
        <>
          <p className="fw-semibold mt-4 mb-2" style={{ fontSize: '0.8rem', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Tilføj til ejendom
          </p>
          <form onSubmit={handleAdd} className="d-flex gap-2 align-items-end">
            <div style={{ flex: 2 }}>
              <select
                className="form-select form-select-sm"
                value={addPropertyId}
                onChange={(e) => setAddPropertyId(e.target.value)}
                required
              >
                <option value="">Vælg ejendom...</option>
                {availableProperties.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <select
                className="form-select form-select-sm"
                value={addRole}
                onChange={(e) => setAddRole(Number(e.target.value) as UserRole)}
              >
                {ALL_MEMBER_ROLE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn btn-primary btn-sm">Tilføj</button>
          </form>
        </>
      )}
    </ModalShell>
  )
}
