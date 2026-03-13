import { Navigate, Outlet } from 'react-router-dom'
import { useMeQuery } from '../features/auth/authApi'

export function ProtectedRoute() {
  const { data: user, isLoading, isError } = useMeQuery()

  if (isLoading) {
    return (
      <div
        className="d-flex align-items-center justify-content-center"
        style={{ minHeight: '100vh' }}
      >
        <div className="spinner-border text-primary" role="status" style={{ width: '1.5rem', height: '1.5rem', borderWidth: '2px' }}>
          <span className="visually-hidden">Indlæser…</span>
        </div>
      </div>
    )
  }

  if (isError || !user) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
