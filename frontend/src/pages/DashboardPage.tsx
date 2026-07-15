import { useTranslation, Trans } from 'react-i18next'
import { useMeQuery } from '../features/auth/authApi'

export function DashboardPage() {
  const { t } = useTranslation()
  const { data: user } = useMeQuery()

  return (
    <div className="container-xl px-4 py-5">
      <h1 className="fw-bold mb-1" style={{ fontSize: '1.75rem', color: '#0d1b2a' }}>
        {t('nav.overview')}
      </h1>
      {user && (
        <p className="text-secondary mb-0">
          <Trans i18nKey="dashboard.loggedInAs" values={{ email: user.email }} components={{ s: <strong /> }} />
          {user.memberships.length > 0 && (
            <> · {user.memberships.map((m) => m.propertyName).join(', ')}</>
          )}
        </p>
      )}
    </div>
  )
}
