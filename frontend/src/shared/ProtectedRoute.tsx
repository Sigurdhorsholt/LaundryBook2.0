import { Navigate, Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMeQuery } from '../features/auth/authApi'

export function ProtectedRoute() {
  const { t } = useTranslation()
  const { data: user, isLoading, isError } = useMeQuery()

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

  if (isError || !user) {
    return <Navigate to="/" replace />
  }

  return (
    <>
      <meta name="robots" content="noindex, nofollow" />
      <Outlet />
    </>
  )
}
