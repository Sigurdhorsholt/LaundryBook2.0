import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDeleteMyAccountMutation } from '../auth/authApi'
import { useLogout } from '../auth/useLogout'
import { ModalShell } from '../../shared/modals/ModalShell'
import { FormError } from '../../shared/ui'
import { extractErrorMessage } from '../../shared/utils/errorUtils'
import { colors } from '../../shared/theme'

interface Props {
  propertyNames: string[]
  onClose: () => void
}

export function DeleteAccountModal({ propertyNames, onClose }: Props) {
  const { t } = useTranslation()
  const checkId = useId()
  const [confirmed, setConfirmed] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastAdmin, setLastAdmin] = useState(false)
  const [deleteMyAccount, { isLoading }] = useDeleteMyAccountMutation()
  // Signs out of Firebase and clears the cache, so nothing of the deleted account lingers in the tab
  const finish = useLogout()

  async function handleDelete() {
    setError(null)
    setLastAdmin(false)
    try {
      await deleteMyAccount().unwrap()
      await finish()
    } catch (err) {
      setLastAdmin((err as { data?: { code?: string } })?.data?.code === 'last_admin')
      setError(extractErrorMessage(err, t('profile.deleteAccount.failed')))
    }
  }

  return (
    <ModalShell title={t('profile.deleteAccount.title')} onClose={onClose} closable={!isLoading}>
      <p style={{ fontSize: '0.9rem', color: colors.textPrimary }}>{t('profile.deleteAccount.intro')}</p>
      <ul style={{ fontSize: '0.88rem', color: colors.textSecondary }}>
        {propertyNames.length > 0 && <li>{t('profile.deleteAccount.removedFrom', { properties: propertyNames.join(', ') })}</li>}
        <li>{t('profile.deleteAccount.bookingsCancelled')}</li>
        <li>{t('profile.deleteAccount.historyDeleted')}</li>
        <li>{t('profile.deleteAccount.downloadFirst')}</li>
      </ul>
      <div className="form-check mb-3">
        <input id={checkId} type="checkbox" className="form-check-input" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} />
        <label htmlFor={checkId} className="form-check-label" style={{ fontSize: '0.88rem', color: colors.textPrimary }}>
          {t('profile.deleteAccount.confirm')}
        </label>
      </div>
      <FormError message={error} />
      {lastAdmin && <p style={{ fontSize: '0.85rem', color: colors.textSecondary }}>{t('profile.deleteAccount.lastAdminHint')}</p>}
      <div className="d-flex justify-content-end gap-2">
        <button type="button" className="btn btn-outline-secondary" disabled={isLoading} onClick={onClose}>
          {t('profile.deleteAccount.cancel')}
        </button>
        <button type="button" className="btn btn-danger fw-semibold" disabled={!confirmed || isLoading} onClick={handleDelete}>
          {isLoading ? t('profile.deleteAccount.deleting') : t('profile.deleteAccount.submit')}
        </button>
      </div>
    </ModalShell>
  )
}
