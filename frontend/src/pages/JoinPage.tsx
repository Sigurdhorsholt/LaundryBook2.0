import { useState, useEffect } from 'react'
import { Navigate, useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useTranslation, Trans } from 'react-i18next'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { firebaseAuth } from '../lib/firebase'
import { useGetInviteInfoQuery, useRedeemInviteMutation, useMeQuery } from '../features/auth/authApi'

export function JoinPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const inviteToken = searchParams.get('token') ?? ''

  const { data: session, isLoading: isCheckingSession } = useMeQuery()
  const { data: invite, isLoading: isLoadingInvite, isError: isInvalidToken } = useGetInviteInfoQuery(
    inviteToken,
    { skip: !inviteToken },
  )

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  useEffect(() => { if (invite?.email) setEmail(invite.email) }, [invite?.email])
  const [password, setPassword] = useState('')
  const [apartment, setApartment] = useState('')
  const [consent, setConsent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [redeemInvite, { isLoading }] = useRedeemInviteMutation()

  if (isCheckingSession || isLoadingInvite) return null
  if (session) return <Navigate to="/dashboard" replace />

  if (!inviteToken || isInvalidToken) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="text-center">
          <p className="fw-semibold mb-2" style={{ color: '#0d1b2a' }}>{t('join.invalidLinkTitle')}</p>
          <p style={{ color: '#5a6a7a', fontSize: '0.9rem' }}>{t('join.invalidLinkBody')}</p>
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
        firstName,
        lastName,
        acceptedTerms: consent,
      }).unwrap()
      navigate('/dashboard', { replace: true })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('join.genericError'))
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
          <h1 className="fw-bold mb-1" style={{ fontSize: '1.4rem', color: '#0d1b2a' }}>{t('join.title')}</h1>
          <p style={{ color: '#5a6a7a', fontSize: '0.9rem' }}>{t('join.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="d-flex gap-2">
            <div className="flex-grow-1">
              <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 500, color: '#0d1b2a' }}>
                {t('join.firstName')}
              </label>
              <input
                className="form-control"
                type="text"
                placeholder={t('join.firstName')}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                autoComplete="given-name"
                autoFocus
              />
            </div>
            <div className="flex-grow-1">
              <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 500, color: '#0d1b2a' }}>
                {t('join.lastName')}
              </label>
              <input
                className="form-control"
                type="text"
                placeholder={t('join.lastName')}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                autoComplete="family-name"
              />
            </div>
          </div>

          <div>
            <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 500, color: '#0d1b2a' }}>
              {t('join.email')}
            </label>
            <input
              className="form-control"
              type="email"
              placeholder={t('join.emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              readOnly={!!invite?.email}
              style={invite?.email ? { backgroundColor: '#f8fafb', cursor: 'default' } : undefined}
            />
          </div>

          <div>
            <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 500, color: '#0d1b2a' }}>
              {t('join.password')}
            </label>
            <input
              className="form-control"
              type="password"
              placeholder={t('join.passwordPlaceholder')}
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
                {t('join.apartment')}
                {invite?.isMultiUse && (
                  <span style={{ color: '#a0adb8', fontWeight: 400 }}> {t('join.optional')}</span>
                )}
              </label>
              <input
                className="form-control"
                type="text"
                placeholder={t('join.apartmentPlaceholder')}
                maxLength={20}
                value={apartment}
                onChange={(e) => setApartment(e.target.value)}
              />
            </div>
          )}

          <label className="d-flex align-items-start gap-2" style={{ fontSize: '0.82rem', color: '#5a6a7a', lineHeight: 1.5 }}>
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} required style={{ marginTop: 3 }} />
            <span>
              <Trans
                i18nKey="common.acceptTerms"
                components={{
                  terms: <Link to="/vilkaar" target="_blank" style={{ color: '#1565c0', textDecoration: 'underline' }} />,
                  privacy: <Link to="/privatliv" target="_blank" style={{ color: '#1565c0', textDecoration: 'underline' }} />,
                }}
              />
            </span>
          </label>

          {error && <p style={{ color: '#dc3545', margin: 0, fontSize: 14 }}>{error}</p>}

          <button className="btn btn-primary fw-semibold" type="submit" disabled={isLoading || !consent}>
            {isLoading ? t('join.creatingAccount') : t('join.submit')}
          </button>
        </form>
      </div>
    </div>
  )
}
