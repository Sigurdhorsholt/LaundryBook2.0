import { useState } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { firebaseAuth } from '../lib/firebase'
import { useGetInviteInfoQuery, useRedeemInviteMutation, useMeQuery } from '../features/auth/authApi'

export function JoinPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const inviteToken = searchParams.get('token') ?? ''

  const { data: session, isLoading: isCheckingSession } = useMeQuery()
  const { data: invite, isLoading: isLoadingInvite, isError: isInvalidToken } = useGetInviteInfoQuery(
    inviteToken,
    { skip: !inviteToken },
  )

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [apartment, setApartment] = useState('')
  const [error, setError] = useState<string | null>(null)

  const [redeemInvite, { isLoading }] = useRedeemInviteMutation()

  if (isCheckingSession || isLoadingInvite) return null
  if (session) return <Navigate to="/dashboard" replace />

  if (!inviteToken || isInvalidToken) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="text-center">
          <p className="fw-semibold mb-2" style={{ color: '#0d1b2a' }}>Ugyldigt eller udløbet invitationslink</p>
          <p style={{ color: '#5a6a7a', fontSize: '0.9rem' }}>Bed din administrator om at sende et nyt link.</p>
        </div>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    try {
      const credential = await createUserWithEmailAndPassword(firebaseAuth, email, password)
      const idToken = await credential.user.getIdToken()
      await redeemInvite({
        idToken,
        inviteToken,
        apartmentNumber: apartment || undefined,
      }).unwrap()
      navigate('/dashboard', { replace: true })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Noget gik galt. Prøv igen.')
    }
  }

  const showApartmentField = invite?.isMultiUse || !invite?.apartmentNumber

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f8fafb' }}>
      <div className="bg-white rounded-3 p-4 p-md-5" style={{ width: '100%', maxWidth: 400, border: '1px solid #e8ecf0' }}>
        <div className="text-center mb-4">
          <svg className="mb-3" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1565c0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="4" />
            <path d="M2 12h3M19 12h3M12 2v3M12 19v3" />
          </svg>
          <h1 className="fw-bold mb-1" style={{ fontSize: '1.4rem', color: '#0d1b2a' }}>Opret din konto</h1>
          <p style={{ color: '#5a6a7a', fontSize: '0.9rem' }}>Du er inviteret til LaundryBook</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 500, color: '#0d1b2a' }}>
              E-mail
            </label>
            <input
              className="form-control"
              type="email"
              placeholder="din@email.dk"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              autoFocus
            />
          </div>

          <div>
            <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 500, color: '#0d1b2a' }}>
              Adgangskode
            </label>
            <input
              className="form-control"
              type="password"
              placeholder="Mindst 6 tegn"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>

          {showApartmentField && (
            <div>
              <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 500, color: '#0d1b2a' }}>
                Lejlighedsnummer
                {invite?.isMultiUse && (
                  <span style={{ color: '#a0adb8', fontWeight: 400 }}> (valgfri)</span>
                )}
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
          )}

          {error && <p style={{ color: '#dc3545', margin: 0, fontSize: 14 }}>{error}</p>}

          <button className="btn btn-primary fw-semibold" type="submit" disabled={isLoading}>
            {isLoading ? 'Opretter konto…' : 'Opret konto og log ind'}
          </button>
        </form>
      </div>
    </div>
  )
}
