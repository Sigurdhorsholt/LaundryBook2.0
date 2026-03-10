import { useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { firebaseAuth } from '../lib/firebase'
import { useMeQuery, useLogoutMutation } from '../features/auth/authApi'

export function DashboardPage() {
  const navigate = useNavigate()
  const { data: user } = useMeQuery()
  const [logout] = useLogoutMutation()

  async function handleLogout() {
    await logout()
    await signOut(firebaseAuth)
    navigate('/login', { replace: true })
  }

  return (
    <div style={{ padding: 32 }}>
      <h1>Dashboard</h1>
      {user && (
        <div>
          <p>Signed in as <strong>{user.email}</strong></p>
          <p>Memberships: {user.memberships.length === 0 ? 'None' : user.memberships.map(m => m.propertyName).join(', ')}</p>
        </div>
      )}
      <button onClick={handleLogout} style={{ marginTop: 16 }}>Sign out</button>
    </div>
  )
}
