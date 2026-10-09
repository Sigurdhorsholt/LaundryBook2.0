import { skipToken } from '@reduxjs/toolkit/query/react'
import { useMeQuery } from '../auth/authApi'
import { useGetPropertyQuery } from './propertiesApi'

// A property's name for the admin pages. Members have it on their membership; a SysAdmin who opens a
// property they aren't a member of gets it from the property itself.
export function usePropertyName(propertyId: string | undefined): string | undefined {
  const { data: user } = useMeQuery()
  const membership = user?.memberships.find(m => m.propertyId === propertyId)
  const { data: property } = useGetPropertyQuery(propertyId && user && !membership ? propertyId : skipToken)
  return membership?.propertyName ?? property?.name
}
