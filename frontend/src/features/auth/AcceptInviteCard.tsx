import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation, Trans } from 'react-i18next'
import { signOut } from 'firebase/auth'
import { firebaseAuth } from '../../lib/firebase'
import { baseApi } from '../../app/baseApi'
import { BrandLogo } from '../../shared/BrandLogo'
import { FormError, FormLabel } from '../../shared/ui'
import { colors } from '../../shared/theme'
import { useAcceptInviteMutation, useLogoutMutation, type CurrentUserDto, type InviteInfoDto } from './authApi'
import { authErrorMessage } from './utils'

interface Props {
  invite: InviteInfoDto
  inviteToken: string
  user: CurrentUserDto
}

export function AcceptInviteCard({ invite, inviteToken, user }: Props) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [acceptInvite, { isLoading }] = useAcceptInviteMutation()
  const [logout] = useLogoutMutation()

  const [apartment, setApartment] = useState('')
  const [consent, setConsent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const emailMismatch = !!invite.email && invite.email.toLowerCase() !== user.email.toLowerCase()
  const showApartmentField = invite.isMultiUse || !invite.apartmentNumber

  async function handleLogout() {
    await logout()
    await signOut(firebaseAuth)
    dispatch(baseApi.util.resetApiState())
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      await acceptInvite({ inviteToken, apartmentNumber: apartment || undefined, acceptedTerms: consent }).unwrap()
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(authErrorMessage(err, t, t('join.genericError')))
    }
  }

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', backgroundColor: colors.bgPage }}>
      <div className="bg-white rounded-3 p-4 p-md-5" style={{ width: '100%', maxWidth: 400, border: `1px solid ${colors.borderDefault}` }}>
        <div className="text-center mb-4">
          <BrandLogo size={28} />
          <h1 className="fw-bold mb-1 mt-3" style={{ fontSize: '1.4rem', color: colors.textPrimary }}>
            {t('join.acceptTitle', { property: invite.propertyName })}
          </h1>
          <p style={{ color: colors.textSecondary, fontSize: '0.9rem' }}>
            {emailMismatch
              ? t('join.emailMismatch', { inviteEmail: invite.email, email: user.email })
              : t('join.acceptSubtitle', { email: user.email })}
          </p>
        </div>

        {emailMismatch ? (
          <button type="button" className="btn btn-primary fw-semibold w-100" onClick={handleLogout}>
            {t('join.useOtherAccount')}
          </button>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {showApartmentField && (
              <div>
                <FormLabel htmlFor="accept-apartment" hint={invite.isMultiUse ? t('join.optional') : undefined}>
                  {t('join.apartment')}
                </FormLabel>
                <input
                  id="accept-apartment"
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

            <button className="btn btn-primary fw-semibold" type="submit" disabled={isLoading || !consent}>
              {isLoading ? t('join.accepting') : t('join.acceptSubmit')}
            </button>
            <button type="button" className="btn btn-link btn-sm" style={{ color: colors.textSecondary }} onClick={handleLogout}>
              {t('join.useOtherAccount')}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
