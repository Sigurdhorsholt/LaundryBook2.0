import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMeQuery, UserRole } from '../../features/auth/authApi'
import { getHighestRole } from '../../shared/roleUtils'
import { useRoleLabel } from '../../shared/constants'
import { PropertyCard } from '../../features/properties/PropertyCard'
import { SetupChecklist } from '../../features/properties/SetupChecklist'
import { PageHeader } from '../../shared/ui'
import { colors } from '../../shared/theme'

export function AdminDashboardPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const roleLabel = useRoleLabel()
  const { data: user } = useMeQuery()
  const role = user ? getHighestRole(user) : null
  const adminMemberships = user?.memberships.filter((m) => m.role >= UserRole.ComplexAdmin) ?? [];

  return (
    <div className="p-4 p-lg-5">

      <PageHeader
        title={t('nav.overview')}
        description={user
          ? t('adminDashboard.greeting', {
              name: user.firstName || user.email,
              roleSuffix: role !== null ? ` · ${roleLabel(role)}` : '',
            })
          : undefined
        }
      />

      {adminMemberships.slice(0, 6).map((m) => (
        <SetupChecklist key={m.propertyId} propertyId={m.propertyId} propertyName={m.propertyName} />
      ))}

      {/* Property cards */}
      {adminMemberships.length > 0 && (
        <div>
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h2 className="fw-semibold mb-0" style={{ fontSize: '1rem', color: colors.textPrimary }}>{t('adminDashboard.propertiesHeading')}</h2>
            {adminMemberships.length > 3 && (
              <button
                className="btn btn-sm"
                style={{ fontSize: '0.82rem', color: colors.primary, border: 'none', background: 'none' }}
                onClick={() => navigate('/admin/properties')}
              >
                {t('adminDashboard.seeAll')}
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
