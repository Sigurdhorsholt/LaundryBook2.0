import { useParams } from 'react-router-dom'
import { useMeQuery, UserRole } from '../../../features/auth/authApi'

const roleLabel: Record<UserRole, string> = {
  [UserRole.Resident]: 'Beboer',
  [UserRole.ComplexAdmin]: 'Ejendomsadmin',
  [UserRole.OrgAdmin]: 'Organisationsadmin',
  [UserRole.SysAdmin]: 'Systemadmin',
}

const roleBadgeStyle: Record<UserRole, { bg: string; color: string }> = {
  [UserRole.Resident]:     { bg: '#f0f4f8', color: '#5a6a7a' },
  [UserRole.ComplexAdmin]: { bg: '#e8f0fe', color: '#1565c0' },
  [UserRole.OrgAdmin]:     { bg: '#e8f5e9', color: '#2e7d32' },
  [UserRole.SysAdmin]:     { bg: '#fce4ec', color: '#c62828' },
}

// Placeholder residents for visual preview
const PLACEHOLDER_USERS = [
  { id: '1', name: 'Anna Larsen',    email: 'anna@example.com',  apartment: '1A', role: UserRole.ComplexAdmin },
  { id: '2', name: 'Mads Nielsen',   email: 'mads@example.com',  apartment: '1B', role: UserRole.Resident },
  { id: '3', name: 'Sofie Jensen',   email: 'sofie@example.com', apartment: '2A', role: UserRole.Resident },
  { id: '4', name: 'Karl Andersen',  email: 'karl@example.com',  apartment: '2B', role: UserRole.Resident },
  { id: '5', name: 'Lotte Thomsen',  email: 'lotte@example.com', apartment: '3A', role: UserRole.Resident },
]

export function PropertyUsersPage() {
  const { propertyId } = useParams()
  const { data: user } = useMeQuery()
  const property = user?.memberships.find((m) => m.propertyId === propertyId)

  return (
    <div className="p-4 p-lg-5">
      <div className="d-flex align-items-start justify-content-between mb-5 gap-3 flex-wrap">
        <div>
          <p className="mb-1" style={{ fontSize: '0.8rem', color: '#a0adb8', fontWeight: 500 }}>
            {property?.propertyName ?? 'Ejendom'}
          </p>
          <h1 className="fw-bold mb-0" style={{ fontSize: '1.6rem', color: '#0d1b2a' }}>Brugere</h1>
        </div>
        <button
          className="btn btn-primary btn-sm d-flex align-items-center gap-2"
          style={{ borderRadius: '8px', fontSize: '0.85rem' }}
          disabled
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Inviter beboer
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3" style={{ border: '1px solid #e8ecf0', overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="table table-hover mb-0" style={{ fontSize: '0.875rem' }}>
            <thead style={{ backgroundColor: '#f8fafb' }}>
              <tr>
                <th className="border-0 px-4 py-3 fw-semibold" style={{ color: '#5a6a7a', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Navn</th>
                <th className="border-0 px-4 py-3 fw-semibold d-none d-md-table-cell" style={{ color: '#5a6a7a', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</th>
                <th className="border-0 px-4 py-3 fw-semibold" style={{ color: '#5a6a7a', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Lejlighed</th>
                <th className="border-0 px-4 py-3 fw-semibold" style={{ color: '#5a6a7a', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rolle</th>
                <th className="border-0 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {PLACEHOLDER_USERS.map((u) => {
                const badge = roleBadgeStyle[u.role]
                return (
                  <tr key={u.id}>
                    <td className="px-4 py-3 align-middle">
                      <div className="d-flex align-items-center gap-3">
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 fw-semibold"
                          style={{ width: 32, height: 32, backgroundColor: '#e8f0fe', color: '#1565c0', fontSize: '0.78rem' }}
                        >
                          {u.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                        </div>
                        <span className="fw-medium" style={{ color: '#0d1b2a' }}>{u.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-middle d-none d-md-table-cell" style={{ color: '#5a6a7a' }}>{u.email}</td>
                    <td className="px-4 py-3 align-middle" style={{ color: '#0d1b2a' }}>{u.apartment}</td>
                    <td className="px-4 py-3 align-middle">
                      <span className="badge" style={{ backgroundColor: badge.bg, color: badge.color, fontWeight: 500, fontSize: '0.75rem' }}>
                        {roleLabel[u.role]}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-middle text-end">
                      <button className="btn btn-sm" style={{ color: '#5a6a7a', fontSize: '0.8rem' }} disabled>···</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <p className="mt-3" style={{ fontSize: '0.78rem', color: '#a0adb8' }}>
        Data indlæses fra API — viser placeholder indhold.
      </p>
    </div>
  )
}
