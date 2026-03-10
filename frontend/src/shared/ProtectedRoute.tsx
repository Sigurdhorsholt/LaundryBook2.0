import { Navigate, Outlet } from 'react-router-dom'
import { useMeQuery } from '../features/auth/authApi'

export function ProtectedRoute() {
  const { data: user, isLoading, isError } = useMeQuery()

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        Loading…
      </div>
    )
  }

  if (isError || !user) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
