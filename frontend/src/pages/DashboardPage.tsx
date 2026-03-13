import { useMeQuery } from '../features/auth/authApi'

export function DashboardPage() {
  const { data: user } = useMeQuery()

  return (
    <div className="container-xl px-4 py-5">
      <h1 className="fw-bold mb-1" style={{ fontSize: '1.75rem', color: '#0d1b2a' }}>
        Oversigt
      </h1>
      {user && (
        <p className="text-secondary mb-0">
          Logget ind som <strong>{user.email}</strong>
          {user.memberships.length > 0 && (
            <> · {user.memberships.map((m) => m.propertyName).join(', ')}</>
          )}
        </p>
      )}
    </div>
  )
}
