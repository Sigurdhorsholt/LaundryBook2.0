import { Navigate } from 'react-router-dom'
import { useMeQuery } from '../features/auth/authApi'
import { isAdmin } from '../shared/roleUtils'

/**
 * Landing point after login.
 * Reads the user's highest role and redirects accordingly:
 *   Admin (ComplexAdmin+) → /admin
 *   Resident              → /laundry
 */
export function SmartRedirectPage() {
  const { data: user } = useMeQuery()

  // ProtectedRoute guarantees user exists here, but guard anyway
  if (!user) return null

  return <Navigate to={isAdmin(user) ? '/admin' : '/laundry'} replace />
}
