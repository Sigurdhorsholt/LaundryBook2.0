import { useState } from 'react'
import { ModalShell } from '../../shared/modals/ModalShell'
import { useUpdateMemberMutation, type PropertyMemberDto } from './usersApi'
import { ROLE_OPTIONS } from '../../shared/constants'
import type {UserRole} from "../auth/authApi.ts";

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
          <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 500, color: '#0d1b2a' }}>
            Rolle
          </label>
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
          <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 500, color: '#0d1b2a' }}>
            Lejlighed <span style={{ color: '#a0adb8', fontWeight: 400 }}>(valgfri)</span>
          </label>
          <input
            className="form-control"
            type="text"
            placeholder="fx 1A"
            maxLength={20}
            value={apartment}
            onChange={(e) => setApartment(e.target.value)}
          />
        </div>

        {error && <p style={{ color: '#dc3545', margin: 0, fontSize: 14 }}>{error}</p>}

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
