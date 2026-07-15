import { useState } from 'react'
import { Navigate, useNavigate, Link } from 'react-router-dom'
import { useTranslation, Trans } from 'react-i18next'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { firebaseAuth } from '../lib/firebase'
import { useMeQuery, useRegisterMutation } from '../features/auth/authApi'
import { useModal } from '../shared/modals/useModal'
import { BrandLogo } from '../shared/BrandLogo'
import { colors } from '../shared/theme'

export function SignupPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { openModal } = useModal()
  const { data: session, isLoading: isCheckingSession } = useMeQuery()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [propertyName, setPropertyName] = useState('')
  const [propertyAddress, setPropertyAddress] = useState('')
  const [consent, setConsent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [register, { isLoading }] = useRegisterMutation()

  if (isCheckingSession) return null
  if (session) return <Navigate to="/dashboard" replace />

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      const credential = await createUserWithEmailAndPassword(firebaseAuth, email, password)
      const idToken = await credential.user.getIdToken()
      await register({ idToken, firstName, lastName, propertyName, propertyAddress }).unwrap()
      navigate('/dashboard', { replace: true })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('signup.genericError'))
    }
  }

  const labelStyle = { fontSize: '0.85rem', fontWeight: 500, color: colors.textPrimary }

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', backgroundColor: colors.bgPage }}>
      <div className="bg-white rounded-3 p-4 p-md-5 my-4" style={{ width: '100%', maxWidth: 460, border: `1px solid ${colors.borderDefault}` }}>
        <div className="text-center mb-4">
          <BrandLogo size={28} />
          <h1 className="fw-bold mb-1 mt-3" style={{ fontSize: '1.4rem', color: colors.textPrimary }}>{t('signup.title')}</h1>
          <p style={{ color: colors.textSecondary, fontSize: '0.9rem' }}>
            {t('signup.subtitle')}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="d-flex gap-2">
            <div className="flex-grow-1">
              <label className="form-label" style={labelStyle}>{t('signup.firstName')}</label>
              <input className="form-control" type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required autoComplete="given-name" autoFocus />
            </div>
            <div className="flex-grow-1">
              <label className="form-label" style={labelStyle}>{t('signup.lastName')}</label>
              <input className="form-control" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required autoComplete="family-name" />
            </div>
          </div>

          <div>
            <label className="form-label" style={labelStyle}>{t('signup.email')}</label>
            <input className="form-control" type="email" placeholder={t('signup.emailPlaceholder')} value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          </div>

          <div>
            <label className="form-label" style={labelStyle}>{t('signup.password')}</label>
            <input className="form-control" type="password" placeholder={t('signup.passwordPlaceholder')} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} autoComplete="new-password" />
          </div>

          <div>
            <label className="form-label" style={labelStyle}>{t('signup.propertyName')}</label>
            <input className="form-control" type="text" placeholder={t('signup.propertyNamePlaceholder')} maxLength={200} value={propertyName} onChange={(e) => setPropertyName(e.target.value)} required />
          </div>

          <div>
            <label className="form-label" style={labelStyle}>{t('signup.address')}</label>
            <input className="form-control" type="text" placeholder={t('signup.addressPlaceholder')} maxLength={500} value={propertyAddress} onChange={(e) => setPropertyAddress(e.target.value)} required />
          </div>

          <label className="d-flex align-items-start gap-2" style={{ fontSize: '0.82rem', color: colors.textSecondary, lineHeight: 1.5 }}>
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} required style={{ marginTop: 3 }} />
            <span>
              <Trans
                i18nKey="common.acceptTerms"
                components={{
                  terms: <Link to="/vilkaar" target="_blank" style={{ color: colors.primary, textDecoration: 'underline' }} />,
                  privacy: <Link to="/privatliv" target="_blank" style={{ color: colors.primary, textDecoration: 'underline' }} />,
                }}
              />
            </span>
          </label>

          {error && <p style={{ color: colors.dangerText, margin: 0, fontSize: '0.84rem' }}>{error}</p>}

          <button className="btn fw-semibold" type="submit" disabled={isLoading || !consent} style={{ backgroundColor: colors.primary, color: '#fff', border: 'none', borderRadius: 8, padding: '10px', marginTop: 2, opacity: consent ? 1 : 0.6 }}>
            {isLoading ? t('signup.creating') : t('signup.submit')}
          </button>
        </form>

        <p className="text-center mt-3 mb-0" style={{ fontSize: '0.84rem', color: colors.textSecondary }}>
          {t('signup.alreadyHaveAccount')}{' '}
          <button className="btn btn-link p-0 align-baseline" style={{ fontSize: '0.84rem', color: colors.primary, textDecoration: 'underline' }} onClick={() => openModal('login')}>
            {t('signup.login')}
          </button>
        </p>
        <p className="text-center mt-2 mb-0">
          <Link to="/" style={{ fontSize: '0.82rem', color: colors.textMuted, textDecoration: 'none' }}>{t('signup.backToHome')}</Link>
        </p>
      </div>
    </div>
  )
}
