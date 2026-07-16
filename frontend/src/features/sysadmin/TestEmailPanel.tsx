import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { colors } from '../../shared/theme'
import { useMeQuery } from '../auth/authApi'
import { useSendTestEmailMutation } from './sysAdminApi'

const TEMPLATES = [
  { template: 0, labelKey: 'invite' },
  { template: 1, labelKey: 'passwordReset' },
  { template: 2, labelKey: 'adminReset' },
] as const

export function TestEmailPanel() {
  const { t } = useTranslation()
  const { data: user } = useMeQuery()
  const [toEmail, setToEmail] = useState('')
  const [edited, setEdited] = useState(false)
  const [status, setStatus] = useState<{ ok: boolean; email: string } | null>(null)
  const [pending, setPending] = useState<number | null>(null)
  const [sendTestEmail] = useSendTestEmailMutation()

  useEffect(() => {
    if (user?.email && !edited) setToEmail(user.email)
  }, [user?.email, edited])

  async function handleSend(template: number) {
    setStatus(null)
    setPending(template)
    try {
      await sendTestEmail({ toEmail, template }).unwrap()
      setStatus({ ok: true, email: toEmail })
    } catch {
      setStatus({ ok: false, email: toEmail })
    } finally {
      setPending(null)
    }
  }

  return (
    <div>
      <h2 className="fw-bold mb-1" style={{ fontSize: '1.1rem', color: colors.textPrimary }}>{t('sysadmin.testEmail.title')}</h2>
      <p className="mb-3" style={{ color: colors.textSecondary, fontSize: '0.875rem' }}>{t('sysadmin.testEmail.description')}</p>

      <div className="mb-3" style={{ maxWidth: 360 }}>
        <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 500, color: colors.textPrimary }}>
          {t('sysadmin.testEmail.recipientLabel')}
        </label>
        <input
          className="form-control form-control-sm"
          type="email"
          value={toEmail}
          onChange={(e) => { setEdited(true); setToEmail(e.target.value) }}
        />
      </div>

      <div className="d-flex flex-wrap gap-2">
        {TEMPLATES.map(({ template, labelKey }) => (
          <button
            key={template}
            type="button"
            className="btn btn-sm btn-outline-secondary"
            disabled={pending !== null || !toEmail}
            onClick={() => handleSend(template)}
          >
            {pending === template ? t('sysadmin.testEmail.sending') : t(`sysadmin.testEmail.${labelKey}`)}
          </button>
        ))}
      </div>

      {status && (
        <p className="mb-0 mt-3" style={{ fontSize: '0.85rem', color: status.ok ? colors.successText : colors.dangerText }}>
          {status.ok ? t('sysadmin.testEmail.sent', { email: status.email }) : t('sysadmin.testEmail.error')}
        </p>
      )}
    </div>
  )
}
