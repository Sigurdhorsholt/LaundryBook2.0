import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { UserRole } from '../auth/authApi'
import { useInviteByEmailMutation } from './usersApi'
import { useRoleOptions } from '../../shared/constants'
import { IconCheck } from '../../shared/icons'
import { colors } from '../../shared/theme'
import { extractErrorMessage } from '../../shared/utils/errorUtils'
import { FormLabel } from '../../shared/ui/FormLabel'

interface EmailInviteTabProps {
  propertyId: string
  onClose: () => void
  roleOptions?: { value: UserRole; label: string }[]
}

export function EmailInviteTab({ propertyId, onClose, roleOptions }: EmailInviteTabProps) {
  const { t } = useTranslation()
  const defaultRoleOptions = useRoleOptions()
  const options = roleOptions ?? defaultRoleOptions
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<UserRole>(options[0].value)
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
      setError(extractErrorMessage(err, t('common.genericError')))
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
        <p className="fw-semibold mb-1" style={{ color: colors.textPrimary }}>{t('users.inviteSent')}</p>
        <p className="mb-4" style={{ color: colors.textSecondary, fontSize: '0.9rem' }}>
          {t('users.inviteEmailSentMessage', { email })}
        </p>
        <button className="btn btn-primary btn-sm" onClick={onClose}>{t('common.close')}</button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <FormLabel>{t('users.email')}</FormLabel>
        <input
          className="form-control"
          type="email"
          placeholder={t('users.emailPlaceholder')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoFocus
        />
      </div>

      <div className="d-flex gap-3">
        <div style={{ flex: 1 }}>
          <FormLabel>{t('users.role')}</FormLabel>
          <select
            className="form-select"
            value={role}
            onChange={(e) => setRole(Number(e.target.value) as UserRole)}
          >
            {options.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div style={{ flex: 1 }}>
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
      </div>

      {error && <p style={{ color: colors.dangerText, margin: 0, fontSize: '0.85rem' }}>{error}</p>}

      <button className="btn btn-primary fw-semibold" type="submit" disabled={isLoading}>
        {isLoading ? t('users.sending') : t('users.sendInvitation')}
      </button>
    </form>
  )
}
