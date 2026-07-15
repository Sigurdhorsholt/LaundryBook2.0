import { useNavigate } from 'react-router-dom'
import { useMeQuery, UserRole } from '../../features/auth/authApi'
import { getHighestRole } from '../../shared/roleUtils'
import { ROLE_LABEL } from '../../shared/constants'
import { PropertyCard } from '../../features/properties/PropertyCard'
import { PageHeader } from '../../shared/ui'
import { colors } from '../../shared/theme'

export function AdminDashboardPage() {
  const navigate = useNavigate()
  const { data: user } = useMeQuery()
  const role = user ? getHighestRole(user) : null
  const adminMemberships = user?.memberships.filter((m) => m.role >= UserRole.ComplexAdmin) ?? [];

  return (
    <div className="p-4 p-lg-5">

      <PageHeader
        title="Oversigt"
        description={user
          ? `Velkommen tilbage, ${user.firstName || user.email}${role !== null ? ` · ${ROLE_LABEL[role]}` : ''}`
          : undefined
        }
      />

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
                <PropertyCard membership={m} variant="compact" />
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
