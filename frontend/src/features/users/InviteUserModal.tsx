import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { UserRole } from '../auth/authApi'
import { useInviteByEmailMutation, useCreateInviteTokenMutation } from './usersApi'
import { ModalShell } from '../../shared/modals/ModalShell'

interface InviteUserModalProps {
  propertyId: string
  onClose: () => void
}

const ROLE_OPTIONS = [
  { value: UserRole.Resident, label: 'Beboer' },
  { value: UserRole.ComplexAdmin, label: 'Ejendomsadmin' },
]

type Tab = 'email' | 'qr'

export function InviteUserModal({ propertyId, onClose }: InviteUserModalProps) {
  const [tab, setTab] = useState<Tab>('email')

  return (
    <ModalShell title="Inviter bruger" onClose={onClose}>
      <div className="d-flex gap-2 mb-4">
        {(['email', 'qr'] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            className="btn btn-sm"
            style={{
              borderRadius: '8px',
              fontSize: '0.85rem',
              backgroundColor: tab === t ? '#e8f0fe' : 'transparent',
              color: tab === t ? '#1565c0' : '#5a6a7a',
              border: tab === t ? '1px solid #c5d8fb' : '1px solid #e8ecf0',
              fontWeight: tab === t ? 600 : 400,
            }}
            onClick={() => setTab(t)}
          >
            {t === 'email' ? 'E-mail invitation' : 'QR-kode'}
          </button>
        ))}
      </div>

      {tab === 'email' ? (
        <EmailInviteTab propertyId={propertyId} onClose={onClose} />
      ) : (
        <QrInviteTab propertyId={propertyId} />
      )}
    </ModalShell>
  )
}

// ── Email invite tab ─────────────────────────────────────────────────────────

function EmailInviteTab({ propertyId, onClose }: { propertyId: string; onClose: () => void }) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<UserRole>(UserRole.Resident)
  const [apartment, setApartment] = useState('')
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [inviteByEmail, { isLoading }] = useInviteByEmailMutation()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    try {
      await inviteByEmail({
        propertyId,
        email,
        role,
        apartmentNumber: apartment || null,
      }).unwrap()

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
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2e7d32" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <p className="fw-semibold mb-1" style={{ color: '#0d1b2a' }}>Invitation sendt!</p>
        <p className="mb-4" style={{ color: '#5a6a7a', fontSize: '0.9rem' }}>
          {email} modtager en e-mail med link til at oprette adgangskode.
        </p>
        <button className="btn btn-primary btn-sm" onClick={onClose}>Luk</button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 500, color: '#0d1b2a' }}>
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

        <div style={{ flex: 1 }}>
          <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 500, color: '#0d1b2a' }}>
            Lejlighed <span style={{ color: '#a0adb8', fontWeight: 400 }}>(valgfri)</span>
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

// ── QR invite tab ────────────────────────────────────────────────────────────

type QrMode = 'specific' | 'mass'

function QrInviteTab({ propertyId }: { propertyId: string }) {
  const [mode, setMode] = useState<QrMode>('specific')
  const [role, setRole] = useState<UserRole>(UserRole.Resident)
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
    return (
      <div className="text-center">
        {mode === 'mass' ? (
          <p className="mb-1 fw-semibold" style={{ color: '#0d1b2a', fontSize: '0.9rem' }}>Masse-invitation</p>
        ) : null}
        <p className="mb-3" style={{ color: '#5a6a7a', fontSize: '0.88rem' }}>
          {mode === 'mass'
            ? 'Print og hæng op i opgangen. Alle der scanner kan oprette sig. Udløber om 1 år.'
            : 'Send eller vis QR-koden til beboeren. Udløber om 7 dage.'}
        </p>
        <div className="d-inline-block p-3 bg-white rounded-3 mb-3" style={{ border: '1px solid #e8ecf0' }}>
          <QRCodeSVG value={joinUrl} size={200} />
        </div>
        <p className="mb-3" style={{ fontSize: '0.72rem', color: '#a0adb8', wordBreak: 'break-all' }}>
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

  return (
    <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Mode selector */}
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
              backgroundColor: mode === m ? '#0d1b2a' : 'transparent',
              color: mode === m ? '#fff' : '#5a6a7a',
              border: mode === m ? '1px solid #0d1b2a' : '1px solid #e8ecf0',
              fontWeight: mode === m ? 600 : 400,
            }}
            onClick={() => handleModeChange(m)}
          >
            {m === 'specific' ? 'Specifik beboer' : 'Masse-invitation'}
          </button>
        ))}
      </div>

      <p style={{ color: '#5a6a7a', fontSize: '0.85rem', margin: 0 }}>
        {mode === 'specific'
          ? 'Til én bestemt beboer. Kan kun bruges én gang og udløber om 7 dage.'
          : 'Kan bruges af alle. Print og hæng op i opgangen. Beboeren angiver selv lejlighedsnummer.'}
      </p>

      <div className="d-flex gap-3">
        <div style={{ flex: 1 }}>
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

        {mode === 'specific' && (
          <div style={{ flex: 1 }}>
            <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 500, color: '#0d1b2a' }}>
              Lejlighed <span style={{ color: '#a0adb8', fontWeight: 400 }}>(valgfri)</span>
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
        {isLoading ? 'Genererer…' : mode === 'mass' ? 'Generer masse-QR' : 'Generer QR-kode'}
      </button>
    </form>
  )
}
