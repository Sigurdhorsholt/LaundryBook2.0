import { Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMeQuery } from '../features/auth/authApi'
import { ErrorState } from './ui'
import { SignInRequired } from './SignInRequired'

export function ProtectedRoute() {
  const { t } = useTranslation()
  const { data: user, isLoading, error, refetch } = useMeQuery()

  if (isLoading) {
    return (
      <div
        className="d-flex align-items-center justify-content-center"
        style={{ minHeight: '100vh' }}
      >
        <div className="spinner-border text-primary" role="status" style={{ width: '1.5rem', height: '1.5rem', borderWidth: '2px' }}>
          <span className="visually-hidden">{t('common.loading')}</span>
        </div>
      </div>
    )
  }

  // Checked before `user`: a failed refetch keeps the previous (now stale) user in `data`
  if ((error && 'status' in error && error.status === 401) || (!error && !user)) {
    return <SignInRequired />
  }

  // An outage or server error is not a logout — keep the user on the page and let them retry
  if (error) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
        <ErrorState
          title={t('auth.sessionCheckFailedTitle')}
          description={t('auth.sessionCheckFailedBody')}
          onRetry={refetch}
        />
      </div>
    )
  }

  return (
    <>
      <meta name="robots" content="noindex, nofollow" />
      <Outlet />
    </>
  )
}
