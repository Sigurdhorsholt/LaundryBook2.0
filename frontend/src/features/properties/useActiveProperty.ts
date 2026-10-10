import { useCallback } from 'react'
import { useMeQuery } from '../auth/authApi'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { ACTIVE_PROPERTY_KEY, setActiveProperty } from './activePropertySlice'

// The property the resident pages (booking, Ejendommen, Min side) show, for people in more than one
export function useActiveProperty() {
  const { data: user } = useMeQuery()
  const picked = useAppSelector(s => s.activeProperty.propertyId)
  const dispatch = useAppDispatch()
  const memberships = user?.memberships ?? []
  const membership = memberships.find(m => m.propertyId === picked) ?? memberships[0] ?? null

  const select = useCallback((propertyId: string) => {
    try {
      localStorage.setItem(ACTIVE_PROPERTY_KEY, propertyId)
    } catch {
      // Private mode or blocked storage: the choice just lasts until the page reloads
    }
    dispatch(setActiveProperty(propertyId))
  }, [dispatch])

  return { membership, memberships, select }
}
