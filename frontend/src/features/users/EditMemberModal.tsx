import { useState } from 'react'
import { ModalShell } from '../../shared/modals/ModalShell'
import { useUpdateMemberMutation, type PropertyMemberDto } from './usersApi'
import { ROLE_OPTIONS } from '../../shared/constants'
import type {UserRole} from "../auth/authApi.ts";
import { colors } from '../../shared/theme'
import { FormLabel } from '../../shared/ui/FormLabel'

interface EditMemberModalProps {
  propertyId: string
  member: PropertyMemberDto
  onClose: () => void
}

export function EditMemberModal({ propertyId, member, onClose }: EditMemberModalProps) {
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
      setError('Kunne ikke gemme ændringer. Prøv igen.')
    }
  }

  return (
    <ModalShell title={`Rediger — ${displayName}`} onClose={onClose} size="sm">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <FormLabel>Rolle</FormLabel>
          <select
            className="form-select"
            value={role}
            onChange={(e) => setRole(Number(e.target.value) as UserRole)}
          >
            {ROLE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div>
          <FormLabel hint="(valgfri)">Lejlighed</FormLabel>
          <input
            className="form-control"
            type="text"
            placeholder="fx 1A"
            maxLength={20}
            value={apartment}
            onChange={(e) => setApartment(e.target.value)}
          />
        </div>

        {error && <p style={{ color: colors.dangerText, margin: 0, fontSize: '0.85rem' }}>{error}</p>}

        <div className="d-flex gap-2 justify-content-end">
          <button type="button" className="btn btn-sm btn-outline-secondary" onClick={onClose}>
            Annuller
          </button>
          <button type="submit" className="btn btn-sm btn-primary fw-semibold" disabled={isLoading}>
            {isLoading ? 'Gemmer…' : 'Gem'}
          </button>
        </div>
      </form>
    </ModalShell>
  )
}
