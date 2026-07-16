import { useRef } from 'react'

/**
 * Returns the value, falling back to the last defined value seen. Keeps the
 * previous room's slot structure on screen while a new query is in flight, so
 * navigation never collapses into a full skeleton after first load.
 */
export function useLastDefined<T>(value: T | undefined): T | undefined {
  const last = useRef<T | undefined>(undefined)
  if (value !== undefined) last.current = value
  return value ?? last.current
}
