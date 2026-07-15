import { useState } from 'react'
import { UserRole } from '../auth/authApi'
import { useInviteByEmailMutation } from './usersApi'
import { ROLE_OPTIONS } from '../../shared/constants'
import { IconCheck } from '../../shared/icons'
import { colors } from '../../shared/theme'
import { extractErrorMessage } from '../../shared/utils/errorUtils'
import { FormLabel } from '../../shared/ui/FormLabel'

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
      setError(extractErrorMessage(err))
    }
  }

  if (done) {
    return (
      <div className="text-center py-3">
        <div
          className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
          style={{ width: 48, height: 48, backgroundColor: colors.successBg }}
        >
          <IconCheck size={22} color={colors.successText} strokeWidth={2.5} />
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
        <FormLabel>E-mail</FormLabel>
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
          <FormLabel>Rolle</FormLabel>
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
      </div>

      {error && <p style={{ color: colors.dangerText, margin: 0, fontSize: '0.85rem' }}>{error}</p>}

      <button className="btn btn-primary fw-semibold" type="submit" disabled={isLoading}>
        {isLoading ? 'Sender…' : 'Send invitation'}
      </button>
    </form>
  )
}
