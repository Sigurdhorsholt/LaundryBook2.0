import { useMeQuery, UserRole } from '../../../features/auth/authApi'
import { PageHeader } from '../../../shared/ui/PageHeader'
import { EmptyState } from '../../../shared/ui/EmptyState'
import { PropertyCard } from '../../../features/properties/PropertyCard'

export function PropertiesPage() {
  const { data: user } = useMeQuery()
  const adminMemberships = user?.memberships.filter((m) => m.role >= UserRole.ComplexAdmin) ?? []

  return (
    <div className="p-4 p-lg-5">
      <PageHeader
        title="Ejendomme"
        description={adminMemberships.length === 1
          ? '1 ejendom under din administration'
          : `${adminMemberships.length} ejendomme under din administration`}
      />

      {adminMemberships.length === 0 ? (
        <EmptyState
          title="Ingen ejendomme"
          description="Du har ikke adgang til nogen ejendomme endnu."
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
