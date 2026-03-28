import { useParams } from 'react-router-dom'
import { useMeQuery } from '../../../features/auth/authApi'
import { PageHeader, EmptyState } from '../../../shared/ui'

export function PropertyBookingsPage() {
  const { propertyId } = useParams()
  const { data: user } = useMeQuery()
  const property = user?.memberships.find((m) => m.propertyId === propertyId)

  return (
    <div className="p-4 p-lg-5">
      <PageHeader
        eyebrow={property?.propertyName}
        title="Bookinger"
        description="Oversigt over alle bookinger i ejendommen."
      />
      <EmptyState
        title="Ingen bookinger endnu"
        description="Bookinger vises her når denne funktion er klar."
      />
    </div>
  )
}
