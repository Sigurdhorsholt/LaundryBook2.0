import { useState, useEffect } from 'react'
import { useMeQuery, useForgotPasswordMutation, useUpdateCurrentUserMutation } from '../auth/authApi'
import { FormError } from '../../shared/ui'
import { colors } from '../../shared/theme'

export function UserInfoForm() {
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
      setSaveError('Kunne ikke gemme. Prøv igen.')
    }
  }

  async function handleResetPassword() {
    if (user?.email) await forgotPassword({ email: user.email })
  }

  return (
    <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
      <div className="card-body p-4">
        <h5 className="mb-4" style={{ fontWeight: 600, color: colors.textPrimary }}>Dine oplysninger</h5>
        <form onSubmit={handleSave}>
          <div className="row g-3 mb-3">
            <div className="col-sm-6">
              <label className="form-label" style={{ fontSize: '0.85rem', color: colors.textSecondary }}>Fornavn</label>
              <input
                className="form-control"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="col-sm-6">
              <label className="form-label" style={{ fontSize: '0.85rem', color: colors.textSecondary }}>Efternavn</label>
              <input
                className="form-control"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label" style={{ fontSize: '0.85rem', color: colors.textSecondary }}>E-mailadresse</label>
            <input
              className="form-control"
              value={user?.email ?? ''}
              readOnly
              style={{ backgroundColor: colors.bgSubtle }}
            />
            <div className="form-text" style={{ color: colors.textMuted }}>E-mail kan ikke ændres.</div>
          </div>
          <div className="mb-4">
            <label className="form-label" style={{ fontSize: '0.85rem', color: colors.textSecondary }}>Lejlighedsnummer</label>
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
              Dine oplysninger er gemt.
            </p>
          )}
          <button className="btn btn-primary btn-sm" type="submit" disabled={saving}>
            {saving ? 'Gemmer…' : 'Gem ændringer'}
          </button>
        </form>

        <hr style={{ margin: '1.75rem 0', borderColor: colors.borderDefault }} />

        <h6 className="mb-2" style={{ fontWeight: 600, color: colors.textPrimary }}>Adgangskode</h6>
        <p className="mb-3" style={{ fontSize: '0.85rem', color: colors.textSecondary }}>
          Vi sender dig et link til at nulstille din adgangskode.
        </p>
        {resetSent ? (
          <p style={{ fontSize: '0.85rem', color: colors.successText }}>
            Tjek din indbakke — linket er på vej.
          </p>
        ) : (
          <button
            className="btn btn-outline-secondary btn-sm"
            type="button"
            onClick={handleResetPassword}
            disabled={resetting}
          >
            {resetting ? 'Sender…' : 'Nulstil adgangskode'}
          </button>
        )}
      </div>
    </div>
  )
}
