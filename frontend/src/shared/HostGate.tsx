import { useEffect, type ReactNode } from 'react'
import { matchRoutes, Navigate, useLocation } from 'react-router-dom'
import { routes, type AppRoute } from '../app/routes'
import { hostRole, hostUrl } from './hosts'

// Public pages without a shell belong to the site; everything else is the app unless the route says otherwise
function routeHost(route: AppRoute): 'site' | 'app' | 'both' {
  return route.host ?? (route.layout === 'bare' && !route.protected ? 'site' : 'app')
}

// Sends a page to the host it belongs on, keeping path, query and hash, so old links and printed
// QR codes on laundrybook.dk keep working after the app moved to app.laundrybook.dk
export function HostGate({ children }: { children: ReactNode }) {
  const { pathname, search, hash } = useLocation()
  const role = hostRole()
  // The app's front page is the booking view, so app.laundrybook.dk works as a bookmark
  const appHome = role === 'app' && pathname === '/'
  const route = role === 'both' || appHome ? undefined : matchRoutes(routes, pathname)?.[0]?.route
  const belongs = route ? routeHost(route) : 'both'
  const target = belongs === 'both' || belongs === role ? null : hostUrl(belongs, pathname + search + hash)

  useEffect(() => {
    if (target) window.location.replace(target)
  }, [target])

  if (appHome) return <Navigate to="/dashboard" replace />
  if (target) return null
  return children
}
