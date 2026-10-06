import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { type OpenInviteLinkDto, useRevokeOpenInviteLinkMutation } from './usersApi'
import { formatDateFull } from '../../shared/utils/dateUtils'
import { extractErrorMessage } from '../../shared/utils/errorUtils'
import { colors } from '../../shared/theme'

interface Props {
  propertyId: string
  link: OpenInviteLinkDto
  onShowQr: (token: string) => void
}

export function OpenInviteLinkStatus({ propertyId, link, onShowQr }: Props) {
  const { t } = useTranslation()
  const [revoke, { isLoading }] = useRevokeOpenInviteLinkMutation()
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleRevoke() {
    setError(null)
    try {
      await revoke(propertyId).unwrap()
    } catch (err) {
      setError(extractErrorMessage(err, t('common.genericError')))
      setConfirming(false)
    }
  }

  return (
    <div className="rounded-3 p-3" style={{ border: `1px solid ${colors.borderDefault}`, backgroundColor: colors.bgPage }}>
      <p className="mb-1 fw-semibold" style={{ fontSize: '0.88rem', color: colors.textPrimary }}>{t('users.openLinkActive')}</p>
      <p className="mb-2" style={{ fontSize: '0.8rem', color: colors.textSecondary }}>
        {t('users.openLinkMeta', {
          created: formatDateFull(link.createdAt.slice(0, 10)),
          expires: formatDateFull(link.expiresAt.slice(0, 10)),
        })}
      </p>
      <div className="d-flex flex-wrap gap-2">
        <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => onShowQr(link.token)}>
          {t('users.showQr')}
        </button>
        {confirming ? (
          <>
            <button type="button" className="btn btn-sm btn-danger" disabled={isLoading} onClick={handleRevoke}>
              {isLoading ? t('users.revoking') : t('users.confirmRevoke')}
            </button>
            <button type="button" className="btn btn-sm btn-outline-secondary" disabled={isLoading} onClick={() => setConfirming(false)}>
              {t('common.cancel')}
            </button>
          </>
        ) : (
          <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => setConfirming(true)}>
            {t('users.revokeLink')}
          </button>
        )}
      </div>
      {confirming && (
        <p className="mt-2 mb-0" style={{ fontSize: '0.8rem', color: colors.dangerText }}>{t('users.revokeWarning')}</p>
      )}
      {error && <p className="mt-2 mb-0" style={{ fontSize: '0.8rem', color: colors.dangerText }}>{error}</p>}
    </div>
  )
}
