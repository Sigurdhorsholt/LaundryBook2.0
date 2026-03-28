import { useParams } from 'react-router-dom'
import { useMeQuery } from '../../../features/auth/authApi'
import { PageHeader, EmptyState } from '../../../shared/ui'

export function PropertyTimeslotsPage() {
  const { propertyId } = useParams()
  const { data: user } = useMeQuery()
  const property = user?.memberships.find((m) => m.propertyId === propertyId)

  return (
    <div className="p-4 p-lg-5">
      <PageHeader
        eyebrow={property?.propertyName}
        title="Tidspladser"
        description="Tidspladsskabeloner gentages dagligt og gælder på ubestemt tid."
      />
      <EmptyState
        title="Ingen tidspladser endnu"
        description="Tidspladser kan oprettes når denne funktion er klar."
      />
    </div>
  )
}
