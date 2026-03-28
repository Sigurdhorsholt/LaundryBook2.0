import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { UserRole } from '../auth/authApi'
import { useCreateInviteTokenMutation } from './usersApi'
import { ROLE_OPTIONS } from '../../shared/constants'
import { colors } from '../../shared/theme'

type QrMode = 'specific' | 'mass'

interface QrInviteTabProps {
  propertyId: string
  roleOptions?: { value: UserRole; label: string }[]
}

export function QrInviteTab({ propertyId, roleOptions = ROLE_OPTIONS }: QrInviteTabProps) {
  const [mode, setMode] = useState<QrMode>('specific')
  const [role, setRole] = useState<UserRole>(roleOptions[0].value)
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
      setError(err instanceof Error ? err.message : 'Noget gik galt. Prøv igen.')
    }
  }

  if (joinUrl) {
    const isMass = mode === 'mass'
    const description = isMass
      ? 'Print og hæng op i opgangen. Alle der scanner kan oprette sig. Udløber om 1 år.'
      : 'Send eller vis QR-koden til beboeren. Udløber om 7 dage.'

    return (
      <div className="text-center">
        {isMass && (
          <p className="mb-1 fw-semibold" style={{ color: colors.textPrimary, fontSize: '0.9rem' }}>Masse-invitation</p>
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
            Udskriv
          </button>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => { setToken(null); setApartment('') }}
          >
            Generer nyt
          </button>
        </div>
      </div>
    )
  }

  const modeDescription = mode === 'specific'
    ? 'Til én bestemt beboer. Kan kun bruges én gang og udløber om 7 dage.'
    : 'Kan bruges af alle. Print og hæng op i opgangen. Beboeren angiver selv lejlighedsnummer.'

  const submitLabel = isLoading ? 'Genererer…' : mode === 'mass' ? 'Generer masse-QR' : 'Generer QR-kode'

  return (
    <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="d-flex gap-2">
        {(['specific', 'mass'] as QrMode[]).map((m) => (
          <button
            key={m}
            type="button"
            className="btn btn-sm"
            style={{
              flex: 1,
              borderRadius: '8px',
              fontSize: '0.82rem',
              backgroundColor: mode === m ? colors.textPrimary : 'transparent',
              color: mode === m ? '#fff' : colors.textSecondary,
              border: mode === m ? `1px solid ${colors.textPrimary}` : `1px solid ${colors.borderDefault}`,
              fontWeight: mode === m ? 600 : 400,
            }}
            onClick={() => handleModeChange(m)}
          >
            {m === 'specific' ? 'Specifik beboer' : 'Masse-invitation'}
          </button>
        ))}
      </div>

      <p style={{ color: colors.textSecondary, fontSize: '0.85rem', margin: 0 }}>{modeDescription}</p>

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

        {mode === 'specific' && (
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
        )}
      </div>

      {error && <p style={{ color: '#dc3545', margin: 0, fontSize: 14 }}>{error}</p>}

      <button className="btn btn-primary fw-semibold" type="submit" disabled={isLoading}>
        {submitLabel}
      </button>
    </form>
  )
}
