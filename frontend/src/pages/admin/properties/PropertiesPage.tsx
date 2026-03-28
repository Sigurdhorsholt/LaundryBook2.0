import { useNavigate } from 'react-router-dom'
import { useMeQuery, UserRole } from '../../../features/auth/authApi'
import { ROLE_LABEL } from '../../../shared/constants'
import { IconBuilding } from '../../../shared/icons'
import { colors } from '../../../shared/theme'

export function PropertiesPage() {
  const navigate = useNavigate()
  const { data: user } = useMeQuery()
  const adminMemberships = user?.memberships.filter((m) => m.role >= UserRole.ComplexAdmin) ?? []

  return (
    <div className="p-4 p-lg-5">
      <div className="d-flex align-items-start justify-content-between mb-5 gap-3">
        <div>
          <h1 className="fw-bold mb-1" style={{ fontSize: '1.75rem', color: colors.textPrimary }}>
            Ejendomme
          </h1>
          <p className="mb-0" style={{ color: colors.textSecondary }}>
            {adminMemberships.length === 1
              ? '1 ejendom under din administration'
              : `${adminMemberships.length} ejendomme under din administration`}
          </p>
        </div>
      </div>

      {adminMemberships.length === 0 ? (
        <div
          className="rounded-3 d-flex flex-column align-items-center justify-content-center text-center p-5"
          style={{ border: `2px dashed ${colors.borderDefault}`, minHeight: 240 }}
        >
          <p className="fw-semibold mb-1" style={{ color: colors.textPrimary }}>Ingen ejendomme</p>
          <p style={{ color: colors.textSecondary, fontSize: '0.9rem' }}>
            Du har ikke adgang til nogen ejendomme endnu.
          </p>
        </div>
      ) : (
        <div className="row g-4">
          {adminMemberships.map((m) => (
            <div key={m.propertyId} className="col-12 col-lg-6 col-xxl-4">
              <div
                className="bg-white rounded-3 p-4 h-100 d-flex flex-column"
                style={{ border: `1px solid ${colors.borderDefault}`, cursor: 'pointer', transition: 'box-shadow 0.15s' }}
                onClick={() => navigate(`/admin/properties/${m.propertyId}/users`)}
                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 4px 20px rgba(13,59,122,0.09)')}
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
              >
                {/* Property icon + name */}
                <div className="d-flex align-items-center gap-3 mb-4">
                  <div
                    className="rounded-2 d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{ width: 44, height: 44, backgroundColor: colors.primaryLight }}
                  >
                    <IconBuilding size={20} color={colors.primary} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p className="fw-bold mb-0 text-truncate" style={{ color: colors.textPrimary }}>
                      {m.propertyName}
                    </p>
                    <span
                      className="badge"
                      style={{ backgroundColor: colors.primaryLight, color: colors.primary, fontSize: '0.72rem', fontWeight: 500 }}
                    >
                      {ROLE_LABEL[m.role]}
                    </span>
                  </div>
                </div>

                {/* Quick links */}
                <div className="row g-2 mt-auto">
                  {[
                    { label: 'Brugere', path: 'users' },
                    { label: 'Indstillinger', path: 'settings' },
                    { label: 'Vaskerum', path: 'laundry' },
                    { label: 'Bookinger', path: 'bookings' },
                  ].map((link) => (
                    <div key={link.path} className="col-6">
                      <button
                        className="btn w-100 text-start"
                        style={{
                          fontSize: '0.82rem',
                          color: colors.textSecondary,
                          backgroundColor: colors.bgPage,
                          border: `1px solid ${colors.borderDefault}`,
                          borderRadius: '8px',
                          padding: '6px 10px',
                        }}
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/admin/properties/${m.propertyId}/${link.path}`)
                        }}
                      >
                        {link.label} →
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
