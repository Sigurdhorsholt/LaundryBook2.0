import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ModalShell } from '../../shared/modals/ModalShell'
import { useGetUserWithMembershipsQuery, useAssignUserToPropertyMutation } from './sysAdminApi'
import type { SysAdminUserDto } from './sysAdminApi'
import { useUpdateMemberMutation, useRemoveMemberMutation } from '../users/usersApi'
import { useGetMyPropertiesQuery } from '../properties/propertiesApi'
import { useAllMemberRoleOptions } from '../../shared/constants'
import { UserRole } from '../auth/authApi'
import { colors } from '../../shared/theme'
import { extractErrorMessage } from '../../shared/utils/errorUtils'
import { FormError } from '../../shared/ui'

interface ManageUserMembershipsModalProps {
  user: SysAdminUserDto
  onClose: () => void
}

export function ManageUserMembershipsModal({ user, onClose }: ManageUserMembershipsModalProps) {
  const { t } = useTranslation()
  const allMemberRoleOptions = useAllMemberRoleOptions()
  const { data: detail, isLoading } = useGetUserWithMembershipsQuery(user.id)
  const { data: allProperties = [] } = useGetMyPropertiesQuery()
  const [updateMember] = useUpdateMemberMutation()
  const [removeMember] = useRemoveMemberMutation()
  const [assignToProperty] = useAssignUserToPropertyMutation()

  const [error, setError] = useState<string | null>(null)
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null)
  const [addPropertyId, setAddPropertyId] = useState('')
  const [addRole, setAddRole] = useState<UserRole>(UserRole.ComplexAdmin)

  const memberPropertyIds = new Set(detail?.memberships.map((m) => m.propertyId) ?? [])
  const availableProperties = allProperties.filter((p) => !memberPropertyIds.has(p.id))

  // Every action here used to fire-and-forget: failures (e.g. last admin) were invisible
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

  async function handleRoleChange(propertyId: string, role: UserRole, apartmentNumber: string | null, isActive: boolean) {
    await run(() => updateMember({ propertyId, userId: user.id, role, apartmentNumber, isActive }).unwrap())
  }

  async function handleToggleActive(propertyId: string, role: UserRole, apartmentNumber: string | null, isActive: boolean) {
    await run(() => updateMember({ propertyId, userId: user.id, role, apartmentNumber, isActive: !isActive }).unwrap())
  }

  async function handleRemove(propertyId: string) {
    setConfirmRemoveId(null)
    await run(() => removeMember({ propertyId, userId: user.id }).unwrap())
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!addPropertyId) return
    const ok = await run(() => assignToProperty({ userId: user.id, propertyId: addPropertyId, role: addRole, apartmentNumber: null }).unwrap())
    if (!ok) return
    setAddPropertyId('')
    setAddRole(UserRole.ComplexAdmin)
  }

  return (
    <ModalShell title={t('sysadmin.manageAccess')} onClose={onClose} size="lg">
      <p className="mb-4" style={{ color: colors.textSecondary, fontSize: '0.875rem' }}>
        <strong style={{ color: colors.textPrimary }}>{user.firstName} {user.lastName}</strong> · {user.email}
      </p>

      <p className="fw-semibold mb-2" style={{ fontSize: '0.8rem', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {t('sysadmin.currentProperties')}
      </p>

      <FormError message={error} />

      {isLoading && <p style={{ color: colors.textSecondary, fontSize: '0.9rem' }}>{t('sysadmin.loading')}</p>}

      {!isLoading && detail?.memberships.length === 0 && (
        <p style={{ color: colors.textSecondary, fontSize: '0.9rem', marginBottom: 16 }}>{t('sysadmin.noProperties')}</p>
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
            {allMemberRoleOptions.map((o) => (
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
            {m.isActive ? t('sysadmin.active') : t('sysadmin.inactive')}
          </button>

          {confirmRemoveId === m.propertyId ? (
            <>
              <button type="button" className="btn btn-sm btn-danger" onClick={() => handleRemove(m.propertyId)}>
                {t('sysadmin.confirmRemove')}
              </button>
              <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setConfirmRemoveId(null)}>
                {t('common.cancel')}
              </button>
            </>
          ) : (
            <button
              type="button"
              className="btn btn-sm btn-outline-danger"
              onClick={() => setConfirmRemoveId(m.propertyId)}
            >
              {t('sysadmin.remove')}
            </button>
          )}
        </div>
      ))}

      {availableProperties.length > 0 && (
        <>
          <p className="fw-semibold mt-4 mb-2" style={{ fontSize: '0.8rem', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {t('sysadmin.addToProperty')}
          </p>
          <form onSubmit={handleAdd} className="d-flex gap-2 align-items-end">
            <div style={{ flex: 2 }}>
              <select
                className="form-select form-select-sm"
                value={addPropertyId}
                onChange={(e) => setAddPropertyId(e.target.value)}
                required
              >
                <option value="">{t('sysadmin.selectProperty')}</option>
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
                {allMemberRoleOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn btn-primary btn-sm">{t('sysadmin.add')}</button>
          </form>
        </>
      )}
    </ModalShell>
  )
}
