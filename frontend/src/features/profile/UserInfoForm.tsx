import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useMeQuery, useForgotPasswordMutation, useUpdateCurrentUserMutation } from '../auth/authApi'
import { FormError } from '../../shared/ui'
import { colors } from '../../shared/theme'

export function UserInfoForm() {
  const { t } = useTranslation()
  const { data: user } = useMeQuery()
  const [updateUser, { isLoading: saving, isSuccess: saved }] = useUpdateCurrentUserMutation()
  const [forgotPassword, { isLoading: resetting, isSuccess: resetSent }] = useForgotPasswordMutation()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName)
      setLastName(user.lastName)
    }
  }, [user])

  const apartment = user?.memberships[0]?.apartmentNumber

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaveError(null)
    try {
      await updateUser({ firstName, lastName }).unwrap()
    } catch {
      setSaveError(t('profile.saveFailed'))
    }
  }

  async function handleResetPassword() {
    if (user?.email) await forgotPassword({ email: user.email })
  }

  return (
    <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
      <div className="card-body p-4">
        <h5 className="mb-4" style={{ fontWeight: 600, color: colors.textPrimary }}>{t('profile.yourInfo')}</h5>
        <form onSubmit={handleSave}>
          <div className="row g-3 mb-3">
            <div className="col-sm-6">
              <label className="form-label" style={{ fontSize: '0.85rem', color: colors.textSecondary }}>{t('profile.firstName')}</label>
              <input
                className="form-control"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="col-sm-6">
              <label className="form-label" style={{ fontSize: '0.85rem', color: colors.textSecondary }}>{t('profile.lastName')}</label>
              <input
                className="form-control"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label" style={{ fontSize: '0.85rem', color: colors.textSecondary }}>{t('profile.emailAddress')}</label>
            <input
              className="form-control"
              value={user?.email ?? ''}
              readOnly
              style={{ backgroundColor: colors.bgSubtle }}
            />
            <div className="form-text" style={{ color: colors.textMuted }}>{t('profile.emailCannotChange')}</div>
          </div>
          <div className="mb-4">
            <label className="form-label" style={{ fontSize: '0.85rem', color: colors.textSecondary }}>{t('profile.apartmentNumber')}</label>
            <input
              className="form-control"
              value={apartment ?? ''}
              readOnly
              style={{ backgroundColor: colors.bgSubtle }}
            />
          </div>
          <FormError message={saveError} />
          {saved && (
            <p className="mb-3" style={{ fontSize: '0.85rem', color: colors.successText }}>
              {t('profile.infoSaved')}
            </p>
          )}
          <button className="btn btn-primary btn-sm" type="submit" disabled={saving}>
            {saving ? t('profile.saving') : t('profile.saveChanges')}
          </button>
        </form>

        <hr style={{ margin: '1.75rem 0', borderColor: colors.borderDefault }} />

        <h6 className="mb-2" style={{ fontWeight: 600, color: colors.textPrimary }}>{t('profile.password')}</h6>
        <p className="mb-3" style={{ fontSize: '0.85rem', color: colors.textSecondary }}>
          {t('profile.passwordResetInfo')}
        </p>
        {resetSent ? (
          <p style={{ fontSize: '0.85rem', color: colors.successText }}>
            {t('profile.resetSent')}
          </p>
        ) : (
          <button
            className="btn btn-outline-secondary btn-sm"
            type="button"
            onClick={handleResetPassword}
            disabled={resetting}
          >
            {resetting ? t('profile.sending') : t('profile.resetPassword')}
          </button>
        )}
      </div>
    </div>
  )
}
