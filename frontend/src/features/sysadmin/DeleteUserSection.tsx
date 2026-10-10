import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDeleteUserMutation } from './sysAdminApi'
import { FormError } from '../../shared/ui'
import { colors } from '../../shared/theme'
import { extractErrorMessage } from '../../shared/utils/errorUtils'

interface Props {
  userId: string
  email: string
  onDeleted: () => void
}

// Irreversible, so the SysAdmin types the email first, as with deleting a repository
export function DeleteUserSection({ userId, email, onDeleted }: Props) {
  const { t } = useTranslation()
  const inputId = useId()
  const [deleteUser, { isLoading }] = useDeleteUserMutation()
  const [typed, setTyped] = useState('')
  const [error, setError] = useState<string | null>(null)
  const matches = typed.trim().toLowerCase() === email.toLowerCase()

  async function handleDelete() {
    setError(null)
    try {
      await deleteUser(userId).unwrap()
      onDeleted()
    } catch (err) {
      setError(extractErrorMessage(err, t('common.genericError')))
    }
  }

  return (
    <section className="rounded-2 p-3 mt-4" style={{ border: `1px solid ${colors.dangerBorder}`, backgroundColor: colors.dangerBg }}>
      <h3 className="mb-1" style={{ fontSize: '0.95rem', fontWeight: 700, color: colors.dangerText }}>{t('sysadmin.userDetail.deleteTitle')}</h3>
      <p className="mb-2" style={{ fontSize: '0.85rem', color: colors.textPrimary }}>{t('sysadmin.userDetail.deleteBody')}</p>
      <label htmlFor={inputId} className="form-label mb-1" style={{ fontSize: '0.8rem', color: colors.textSecondary }}>
        {t('sysadmin.userDetail.deleteConfirmLabel', { email })}
      </label>
      <div className="d-flex flex-wrap gap-2">
        <input
          id={inputId}
          type="email"
          className="form-control form-control-sm"
          style={{ flex: '1 1 220px' }}
          autoComplete="off"
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
        />
        <button type="button" className="btn btn-sm btn-danger fw-semibold" disabled={!matches || isLoading} onClick={handleDelete}>
          {isLoading ? t('sysadmin.userDetail.deleting') : t('sysadmin.userDetail.deleteButton')}
        </button>
      </div>
      <div className="mt-2"><FormError message={error} /></div>
    </section>
  )
}
