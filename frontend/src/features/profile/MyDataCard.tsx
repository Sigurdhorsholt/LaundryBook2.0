import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLazyExportMyDataQuery, useMeQuery } from '../auth/authApi'
import { DeleteAccountModal } from './DeleteAccountModal'
import { FormError } from '../../shared/ui'
import { todayStr } from '../../shared/utils/dateUtils'
import { colors } from '../../shared/theme'

export function MyDataCard() {
  const { t } = useTranslation()
  const { data: user } = useMeQuery()
  const [exportMyData, { isFetching }] = useLazyExportMyDataQuery()
  const [exportError, setExportError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  async function download() {
    setExportError(null)
    try {
      const data = await exportMyData().unwrap()
      const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }))
      const a = document.createElement('a')
      a.href = url
      a.download = `laundrybook-mine-data-${todayStr()}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      setExportError(t('profile.myData.exportFailed'))
    }
  }

  return (
    <section className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
      <div className="card-body p-4">
        <h2 className="mb-2" style={{ fontSize: '1.25rem', fontWeight: 600, color: colors.textPrimary }}>{t('profile.myData.title')}</h2>
        <p style={{ fontSize: '0.85rem', color: colors.textSecondary }}>{t('profile.myData.description')}</p>
        <FormError message={exportError} />
        <div className="d-flex flex-wrap gap-2">
          <button type="button" className="btn btn-outline-secondary btn-sm" style={{ minHeight: 40 }} disabled={isFetching} onClick={download}>
            {isFetching ? t('profile.myData.exporting') : t('profile.myData.export')}
          </button>
          <button
            type="button"
            className="btn btn-sm"
            style={{ minHeight: 40, color: colors.dangerText, border: `1px solid ${colors.dangerBorder}`, backgroundColor: colors.bgCard }}
            onClick={() => setDeleting(true)}
          >
            {t('profile.myData.delete')}
          </button>
        </div>
        {deleting && (
          <DeleteAccountModal
            propertyNames={user?.memberships.map(m => m.propertyName) ?? []}
            onClose={() => setDeleting(false)}
          />
        )}
      </div>
    </section>
  )
}
