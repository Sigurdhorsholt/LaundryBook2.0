import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { QRCodeSVG } from 'qrcode.react'
import { UserRole } from '../auth/authApi'
import { useCreateInviteTokenMutation } from './usersApi'
import { useRoleOptions } from '../../shared/constants'
import { colors } from '../../shared/theme'
import { extractErrorMessage } from '../../shared/utils/errorUtils'
import { FormLabel } from '../../shared/ui/FormLabel'
import { SegmentedControl } from '../../shared/ui/SegmentedControl'

type QrMode = 'specific' | 'mass'

interface QrInviteTabProps {
  propertyId: string
  roleOptions?: { value: UserRole; label: string }[]
}

export function QrInviteTab({ propertyId, roleOptions }: QrInviteTabProps) {
  const { t } = useTranslation()
  const defaultRoleOptions = useRoleOptions()
  const options = roleOptions ?? defaultRoleOptions
  const [mode, setMode] = useState<QrMode>('specific')
  const [role, setRole] = useState<UserRole>(options[0].value)
  const [apartment, setApartment] = useState('')
  const [token, setToken] = useState<string | null>(null)
  const [isMultiUse, setIsMultiUse] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [createToken, { isLoading }] = useCreateInviteTokenMutation()

  const joinUrl = token ? `${window.location.origin}/join?token=${token}` : null

  function handleModeChange(next: QrMode) {
    setMode(next)
    setToken(null)
    setApartment('')
    setError(null)
    setIsMultiUse(next === 'mass')
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      const result = await createToken({
        propertyId,
        role,
        apartmentNumber: mode === 'specific' ? (apartment || null) : null,
        isMultiUse,
      }).unwrap()
      setToken(result.token)
    } catch (err: unknown) {
      setError(extractErrorMessage(err, t('common.genericError')))
    }
  }

  if (joinUrl) {
    const isMass = mode === 'mass'
    const description = isMass
      ? t('users.qrMassDescription')
      : t('users.qrSpecificDescription')

    return (
      <div className="text-center">
        {isMass && (
          <p className="mb-1 fw-semibold" style={{ color: colors.textPrimary, fontSize: '0.9rem' }}>{t('users.massInvite')}</p>
        )}
        <p className="mb-3" style={{ color: colors.textSecondary, fontSize: '0.88rem' }}>{description}</p>
        <div className="d-inline-block p-3 bg-white rounded-3 mb-3" style={{ border: `1px solid ${colors.borderDefault}` }}>
          <QRCodeSVG value={joinUrl} size={200} />
        </div>
        <p className="mb-3" style={{ fontSize: '0.72rem', color: colors.textMuted, wordBreak: 'break-all' }}>
          {joinUrl}
        </p>
        <div className="d-flex justify-content-center gap-2">
          <button className="btn btn-sm btn-outline-secondary" onClick={() => window.print()}>
            {t('users.print')}
          </button>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => { setToken(null); setApartment('') }}
          >
            {t('users.generateNew')}
          </button>
        </div>
      </div>
    )
  }

  const modeDescription = mode === 'specific'
    ? t('users.qrModeSpecific')
    : t('users.qrModeMass')

  const submitLabel = isLoading ? t('users.generating') : mode === 'mass' ? t('users.generateMassQr') : t('users.generateQr')

  return (
    <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <SegmentedControl
        segments={[
          { value: 'specific' as QrMode, label: t('users.specificResident') },
          { value: 'mass' as QrMode, label: t('users.massInvite') },
        ]}
        value={mode}
        onChange={handleModeChange}
        variant="dark"
      />

      <p style={{ color: colors.textSecondary, fontSize: '0.85rem', margin: 0 }}>{modeDescription}</p>

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

        {mode === 'specific' && (
          <div style={{ flex: 1 }}>
            <FormLabel hint={t('users.optional')}>{t('users.apartment')}</FormLabel>
            <input
              className="form-control"
              type="text"
              placeholder={t('users.apartmentPlaceholderShort')}
              maxLength={20}
              value={apartment}
              onChange={(e) => setApartment(e.target.value)}
            />
          </div>
        )}
      </div>

      {error && <p style={{ color: colors.dangerText, margin: 0, fontSize: '0.85rem' }}>{error}</p>}

      <button className="btn btn-primary fw-semibold" type="submit" disabled={isLoading}>
        {submitLabel}
      </button>
    </form>
  )
}
