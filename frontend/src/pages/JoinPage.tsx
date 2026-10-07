import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useTranslation, Trans } from 'react-i18next'
import { useGetInviteInfoQuery, useRedeemInviteMutation, useMeQuery } from '../features/auth/authApi'
import { AcceptInviteCard } from '../features/auth/AcceptInviteCard'
import { createOrSignInFirebaseUser, authErrorMessage } from '../features/auth/utils'
import { Spinner, FormError } from '../shared/ui'
import { BrandLogo } from '../shared/BrandLogo'
import { colors } from '../shared/theme'

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
  const [typedEmail, setTypedEmail] = useState('')
  const email = invite?.email ?? typedEmail
  const [password, setPassword] = useState('')
  const [apartment, setApartment] = useState('')
  const [consent, setConsent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Covers the Firebase step too, not just the backend call, so the button can't be double-submitted
  const [submitting, setSubmitting] = useState(false)

  const [redeemInvite] = useRedeemInviteMutation()

  if (isCheckingSession || isLoadingInvite) return <Spinner fullPage />

  if (!inviteToken || isInvalidToken || !invite) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="text-center">
          <p className="fw-semibold mb-2" style={{ color: colors.textPrimary }}>{t('join.invalidLinkTitle')}</p>
          <p style={{ color: colors.textSecondary, fontSize: '0.9rem' }}>{t('join.invalidLinkBody')}</p>
        </div>
      </div>
    )
  }

  if (session) return <AcceptInviteCard invite={invite} inviteToken={inviteToken} user={session} />

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      const idToken = await createOrSignInFirebaseUser(email, password)
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
      setError(authErrorMessage(err, t, t('join.genericError')))
      setSubmitting(false)
    }
  }

  const showApartmentField = invite.isMultiUse || !invite.apartmentNumber

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: colors.bgPage }}>
      <div className="bg-white rounded-3 p-4 p-md-5" style={{ width: '100%', maxWidth: 400, border: `1px solid ${colors.borderDefault}` }}>
        <div className="text-center mb-4">
          <div className="mb-3"><BrandLogo size={32} /></div>
          <h1 className="fw-bold mb-1" style={{ fontSize: '1.4rem', color: colors.textPrimary }}>{t('join.title')}</h1>
          <p style={{ color: colors.textSecondary, fontSize: '0.9rem' }}>{t('join.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="d-flex gap-2">
            <div className="flex-grow-1">
              <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 500, color: colors.textPrimary }}>
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
              <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 500, color: colors.textPrimary }}>
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
            <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 500, color: colors.textPrimary }}>
              {t('join.email')}
            </label>
            <input
              className="form-control"
              type="email"
              placeholder={t('join.emailPlaceholder')}
              value={email}
              onChange={(e) => setTypedEmail(e.target.value)}
              required
              autoComplete="email"
              readOnly={!!invite.email}
              style={invite.email ? { backgroundColor: colors.bgSubtle, cursor: 'default' } : undefined}
            />
          </div>

          <div>
            <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 500, color: colors.textPrimary }}>
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
              <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 500, color: colors.textPrimary }}>
                {t('join.apartment')}
                {invite.isMultiUse && (
                  <span style={{ color: colors.textMuted, fontWeight: 400 }}> {t('join.optional')}</span>
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

          <FormError message={error} />

          <button className="btn btn-primary fw-semibold" type="submit" disabled={submitting || !consent}>
            {submitting ? t('join.creatingAccount') : t('join.submit')}
          </button>
        </form>
      </div>
    </div>
  )
}
