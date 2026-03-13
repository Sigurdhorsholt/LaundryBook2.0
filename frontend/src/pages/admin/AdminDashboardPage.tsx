import { useNavigate } from 'react-router-dom'
import { useMeQuery, UserRole } from '../../features/auth/authApi'
import { getHighestRole } from '../../shared/roleUtils'

const roleLabel: Record<UserRole, string> = {
  [UserRole.Resident]: 'Beboer',
  [UserRole.ComplexAdmin]: 'Ejendomsadmin',
  [UserRole.OrgAdmin]: 'Organisationsadmin',
  [UserRole.SysAdmin]: 'Systemadmin',
}

export function AdminDashboardPage() {
  const navigate = useNavigate()
  const { data: user } = useMeQuery()
  const role = user ? getHighestRole(user) : null
  const adminMemberships = user?.memberships.filter((m) => m.role >= UserRole.ComplexAdmin) ?? []

  return (
    <div className="p-4 p-lg-5">

      {/* Header */}
      <div className="mb-5">
        <h1 className="fw-bold mb-1" style={{ fontSize: '1.75rem', color: '#0d1b2a' }}>Oversigt</h1>
        {user && (
          <p className="mb-0" style={{ color: '#5a6a7a' }}>
            Velkommen tilbage, <strong>{user.firstName || user.email}</strong>
            {role !== null && (
              <span
                className="ms-2 badge"
                style={{ backgroundColor: '#e8f0fe', color: '#1565c0', fontWeight: 500, fontSize: '0.78rem' }}
              >
                {roleLabel[role]}
              </span>
            )}
          </p>
        )}
      </div>

      {/* Stats */}
      <div className="row g-4 mb-5">
        {[
          { label: 'Aktive bookinger', value: '—', sub: 'i dag' },
          { label: 'Beboere', value: '—', sub: 'registrerede' },
          { label: 'Vaskerum', value: '—', sub: 'aktive' },
        ].map((card) => (
          <div key={card.label} className="col-12 col-sm-6 col-xl-4">
            <div className="p-4 bg-white rounded-3 h-100" style={{ border: '1px solid #e8ecf0' }}>
              <p className="mb-1" style={{ color: '#5a6a7a', fontSize: '0.85rem', fontWeight: 500 }}>{card.label}</p>
              <p className="fw-bold mb-0" style={{ fontSize: '2rem', color: '#0d1b2a', lineHeight: 1.1 }}>{card.value}</p>
              <p className="mb-0 mt-1" style={{ color: '#a0adb8', fontSize: '0.8rem' }}>{card.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Property cards */}
      {adminMemberships.length > 0 && (
        <div>
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h2 className="fw-semibold mb-0" style={{ fontSize: '1rem', color: '#0d1b2a' }}>Dine ejendomme</h2>
            {adminMemberships.length > 3 && (
              <button
                className="btn btn-sm"
                style={{ fontSize: '0.82rem', color: '#1565c0', border: 'none', background: 'none' }}
                onClick={() => navigate('/admin/properties')}
              >
                Se alle →
              </button>
            )}
          </div>
          <div className="row g-3">
            {adminMemberships.slice(0, 6).map((m) => (
              <div key={m.propertyId} className="col-12 col-md-6 col-xl-4">
                <div
                  className="bg-white rounded-3 p-3 d-flex align-items-center gap-3"
                  style={{ border: '1px solid #e8ecf0', cursor: 'pointer', transition: 'box-shadow 0.15s' }}
                  onClick={() => navigate(`/admin/properties/${m.propertyId}/users`)}
                  onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(13,59,122,0.09)')}
                  onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
                >
                  <div
                    className="rounded-2 d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{ width: 40, height: 40, backgroundColor: '#e8f0fe' }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1565c0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                      <polyline points="9 22 9 12 15 12 15 22"/>
                    </svg>
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p className="fw-semibold mb-0 text-truncate" style={{ fontSize: '0.9rem', color: '#0d1b2a' }}>
                      {m.propertyName}
                    </p>
                    <p className="mb-0" style={{ fontSize: '0.78rem', color: '#5a6a7a' }}>
                      {roleLabel[m.role]}{m.apartmentNumber ? ` · Lejl. ${m.apartmentNumber}` : ''}
                    </p>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a0adb8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
