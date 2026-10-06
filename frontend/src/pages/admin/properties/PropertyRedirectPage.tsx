import { Navigate, useParams } from 'react-router-dom'
import { useGetLaundryRoomsQuery } from '../../../features/laundry/laundryApi'
import { Spinner } from '../../../shared/ui'

/** /admin/properties/:propertyId → default first sub-page */
export function PropertyRedirectPage() {
  const { propertyId } = useParams()
  const { data: rooms, isLoading } = useGetLaundryRoomsQuery(propertyId!, { skip: !propertyId })

  if (isLoading) return <Spinner fullPage />
  // A property without rooms isn't set up yet: start where setup starts
  const subPage = rooms && rooms.length === 0 ? 'laundry' : 'users'
  return <Navigate to={`/admin/properties/${propertyId}/${subPage}`} replace />
}
