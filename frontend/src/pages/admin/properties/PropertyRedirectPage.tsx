import { Navigate, useParams } from 'react-router-dom'

/** /admin/properties/:propertyId → default first sub-page */
export function PropertyRedirectPage() {
  const { propertyId } = useParams()
  return <Navigate to={`/admin/properties/${propertyId}/users`} replace />
}
