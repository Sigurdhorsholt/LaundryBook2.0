import { useState } from 'react'
import { UserRole } from '../auth/authApi'
import { useInviteByEmailMutation } from './usersApi'
import { ROLE_OPTIONS } from '../../shared/constants'
import { IconCheck } from '../../shared/icons'
import { colors } from '../../shared/theme'

interface EmailInviteTabProps {
  propertyId: string
  onClose: () => void
  roleOptions?: { value: UserRole; label: string }[]
}

export function EmailInviteTab({ propertyId, onClose, roleOptions = ROLE_OPTIONS }: EmailInviteTabProps) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<UserRole>(roleOptions[0].value)
  const [apartment, setApartment] = useState('')
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [inviteByEmail, { isLoading }] = useInviteByEmailMutation()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      await inviteByEmail({ propertyId, email, role, apartmentNumber: apartment || null }).unwrap()
      setDone(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Noget gik galt. Prøv igen.')
    }
  }

  if (done) {
    return (
      <div className="text-center py-3">
        <div
          className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
          style={{ width: 48, height: 48, backgroundColor: '#e8f5e9' }}
        >
          <IconCheck size={22} color="#2e7d32" strokeWidth={2.5} />
        </div>
        <p className="fw-semibold mb-1" style={{ color: colors.textPrimary }}>Invitation sendt!</p>
        <p className="mb-4" style={{ color: colors.textSecondary, fontSize: '0.9rem' }}>
          {email} modtager en e-mail med link til at oprette adgangskode.
        </p>
        <button className="btn btn-primary btn-sm" onClick={onClose}>Luk</button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 500, color: colors.textPrimary }}>
          E-mail
        </label>
        <input
          className="form-control"
          type="email"
          placeholder="beboer@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoFocus
        />
      </div>

      <div className="d-flex gap-3">
        <div style={{ flex: 1 }}>
          <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 500, color: colors.textPrimary }}>
            Rolle
          </label>
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

        <div style={{ flex: 1 }}>
          <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 500, color: colors.textPrimary }}>
            Lejlighed <span style={{ color: colors.textMuted, fontWeight: 400 }}>(valgfri)</span>
          </label>
          <input
            className="form-control"
            type="text"
            placeholder="1A"
            maxLength={20}
            value={apartment}
            onChange={(e) => setApartment(e.target.value)}
          />
        </div>
      </div>

      {error && <p style={{ color: '#dc3545', margin: 0, fontSize: 14 }}>{error}</p>}

      <button className="btn btn-primary fw-semibold" type="submit" disabled={isLoading}>
        {isLoading ? 'Sender…' : 'Send invitation'}
      </button>
    </form>
  )
}
