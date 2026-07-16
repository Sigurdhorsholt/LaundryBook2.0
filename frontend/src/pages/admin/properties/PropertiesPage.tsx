import { useTranslation } from 'react-i18next'
import { useMeQuery, UserRole } from '../../../features/auth/authApi'
import { PageHeader } from '../../../shared/ui/PageHeader'
import { EmptyState } from '../../../shared/ui/EmptyState'
import { PropertyCard } from '../../../features/properties/PropertyCard'

export function PropertiesPage() {
  const { t } = useTranslation()
  const { data: user } = useMeQuery()
  const adminMemberships = user?.memberships.filter((m) => m.role >= UserRole.ComplexAdmin) ?? []

  return (
    <div className="p-4 p-lg-5">
      <PageHeader
        title={t('adminProperties.list.title')}
        description={t('adminProperties.list.countDescription', { count: adminMemberships.length })}
      />

      {adminMemberships.length === 0 ? (
        <EmptyState
          title={t('adminProperties.list.emptyTitle')}
          description={t('adminProperties.list.emptyDescription')}
        />
      ) : (
        <div className="row g-4">
          {adminMemberships.map((m) => (
            <div key={m.propertyId} className="col-12 col-lg-6 col-xxl-4">
              <PropertyCard membership={m} variant="full" />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
