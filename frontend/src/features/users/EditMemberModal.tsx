import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ModalShell } from '../../shared/modals/ModalShell'
import { useUpdateMemberMutation, type PropertyMemberDto } from './usersApi'
import { useRoleOptions } from '../../shared/constants'
import type {UserRole} from "../auth/authApi.ts";
import { colors } from '../../shared/theme'
import { FormLabel } from '../../shared/ui/FormLabel'

interface EditMemberModalProps {
  propertyId: string
  member: PropertyMemberDto
  onClose: () => void
}

export function EditMemberModal({ propertyId, member, onClose }: EditMemberModalProps) {
  const { t } = useTranslation()
  const roleOptions = useRoleOptions()
  const [apartment, setApartment] = useState(member.apartmentNumber ?? '')
  const [role, setRole] = useState<UserRole>(member.role)
  const [error, setError] = useState<string | null>(null)

  const [updateMember, { isLoading }] = useUpdateMemberMutation()

  const displayName = [member.firstName, member.lastName].filter(Boolean).join(' ') || member.email

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      await updateMember({
        propertyId,
        userId: member.userId,
        apartmentNumber: apartment || null,
        role,
        isActive: member.isActive,
      }).unwrap()
      onClose()
    } catch {
      setError(t('users.saveFailed'))
    }
  }

  return (
    <ModalShell title={t('users.editMember', { name: displayName })} onClose={onClose} size="sm">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <FormLabel>{t('users.role')}</FormLabel>
          <select
            className="form-select"
            value={role}
            onChange={(e) => setRole(Number(e.target.value) as UserRole)}
          >
            {roleOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div>
          <FormLabel hint={t('users.optional')}>{t('users.apartment')}</FormLabel>
          <input
            className="form-control"
            type="text"
            placeholder={t('users.apartmentPlaceholder')}
            maxLength={20}
            value={apartment}
            onChange={(e) => setApartment(e.target.value)}
          />
        </div>

        {error && <p style={{ color: colors.dangerText, margin: 0, fontSize: '0.85rem' }}>{error}</p>}

        <div className="d-flex gap-2 justify-content-end">
          <button type="button" className="btn btn-sm btn-outline-secondary" onClick={onClose}>
            {t('common.cancel')}
          </button>
          <button type="submit" className="btn btn-sm btn-primary fw-semibold" disabled={isLoading}>
            {isLoading ? t('users.saving') : t('common.save')}
          </button>
        </div>
      </form>
    </ModalShell>
  )
}
