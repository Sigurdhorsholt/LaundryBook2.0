import { useNavigate } from 'react-router-dom'
import { useMeQuery, UserRole } from '../../features/auth/authApi'
import { getHighestRole } from '../../shared/roleUtils'
import { ROLE_LABEL } from '../../shared/constants'
import { IconBuilding, IconChevronRight } from '../../shared/icons'
import { colors } from '../../shared/theme'

export function AdminDashboardPage() {
  const navigate = useNavigate()
  const { data: user } = useMeQuery()
  const role = user ? getHighestRole(user) : null
  const adminMemberships = user?.memberships.filter((m) => m.role >= UserRole.ComplexAdmin) ?? [];

  return (
    <div className="p-4 p-lg-5">

      {/* Header */}
      <div className="mb-5">
        <h1 className="fw-bold mb-1" style={{ fontSize: '1.75rem', color: colors.textPrimary }}>Oversigt</h1>
        {user && (
          <p className="mb-0" style={{ color: colors.textSecondary }}>
            Velkommen tilbage, <strong>{user.firstName || user.email}</strong>
            {role !== null && (
              <span
                className="ms-2 badge"
                style={{ backgroundColor: colors.primaryLight, color: colors.primary, fontWeight: 500, fontSize: '0.78rem' }}
              >
                {ROLE_LABEL[role]}
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
            <div className="p-4 bg-white rounded-3 h-100" style={{ border: `1px solid ${colors.borderDefault}` }}>
              <p className="mb-1" style={{ color: colors.textSecondary, fontSize: '0.85rem', fontWeight: 500 }}>{card.label}</p>
              <p className="fw-bold mb-0" style={{ fontSize: '2rem', color: colors.textPrimary, lineHeight: 1.1 }}>{card.value}</p>
              <p className="mb-0 mt-1" style={{ color: colors.textMuted, fontSize: '0.8rem' }}>{card.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Property cards */}
      {adminMemberships.length > 0 && (
        <div>
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h2 className="fw-semibold mb-0" style={{ fontSize: '1rem', color: colors.textPrimary }}>Dine ejendomme</h2>
            {adminMemberships.length > 3 && (
              <button
                className="btn btn-sm"
                style={{ fontSize: '0.82rem', color: colors.primary, border: 'none', background: 'none' }}
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
                  style={{ border: `1px solid ${colors.borderDefault}`, cursor: 'pointer', transition: 'box-shadow 0.15s' }}
                  onClick={() => navigate(`/admin/properties/${m.propertyId}/users`)}
                  onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(13,59,122,0.09)')}
                  onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
                >
                  <div
                    className="rounded-2 d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{ width: 40, height: 40, backgroundColor: colors.primaryLight }}
                  >
                    <IconBuilding size={18} color={colors.primary} />
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p className="fw-semibold mb-0 text-truncate" style={{ fontSize: '0.9rem', color: colors.textPrimary }}>
                      {m.propertyName}
                    </p>
                    <p className="mb-0" style={{ fontSize: '0.78rem', color: colors.textSecondary }}>
                      {ROLE_LABEL[m.role]}{m.apartmentNumber ? ` · Lejl. ${m.apartmentNumber}` : ''}
                    </p>
                  </div>
                  <span className="flex-shrink-0"><IconChevronRight size={16} color={colors.textMuted} /></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
