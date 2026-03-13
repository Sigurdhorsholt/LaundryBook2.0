import { Routes, Route } from 'react-router-dom'
import { routes } from '../app/routes'
import { isEnabled } from '../config/features'
import { useMeQuery } from '../features/auth/authApi'
import { getHighestRole } from './roleUtils'
import { ProtectedRoute } from './ProtectedRoute'
import { AppLayout } from './AppLayout'
import { AdminLayout } from './AdminLayout'
import { NotFoundPage } from '../pages/NotFoundPage'
import type { AppRoute } from '../app/routes'

/**
 * Guards a single route against feature flags and role requirements.
 * ProtectedRoute already guarantees authentication; this checks access level.
 */
function RouteGuard({ route }: { route: AppRoute }) {
  const { data: user } = useMeQuery()

  if (route.feature && !isEnabled(route.feature)) {
    return <NotFoundPage />
  }

  if (route.minRole !== undefined && user) {
    if (getHighestRole(user) < route.minRole) {
      return <NotFoundPage />
    }
  }

  return <route.component />
}

/**
 * Builds the full route tree from the central config in src/app/routes.tsx.
 *
 * Groups:
 *   1. Bare public         — no shell, no auth
 *   2. Bare protected      — no shell, auth required  (smart redirect, etc.)
 *   3. App shell public    — resident navbar, no auth  (rare)
 *   4. App shell protected — resident navbar + auth
 *   5. Admin shell protected — sidebar + auth + role
 *   6. Catch-all 404
 */
export function AppRouter() {
  const barePublic    = routes.filter((r) => r.layout === 'bare'  && !r.protected)
  const bareProtected = routes.filter((r) => r.layout === 'bare'  && r.protected)
  const appPublic     = routes.filter((r) => r.layout === 'app'   && !r.protected)
  const appProtected  = routes.filter((r) => r.layout === 'app'   && r.protected)
  const adminProtected = routes.filter((r) => r.layout === 'admin' && r.protected)

  return (
    <Routes>

      {/* 1. Bare public (landing, login) */}
      {barePublic.map((r) => (
        <Route key={r.path} path={r.path} element={<RouteGuard route={r} />} />
      ))}

      {/* 2. Bare protected (SmartRedirect) */}
      {bareProtected.length > 0 && (
        <Route element={<ProtectedRoute />}>
          {bareProtected.map((r) => (
            <Route key={r.path} path={r.path} element={<RouteGuard route={r} />} />
          ))}
        </Route>
      )}

      {/* 3. App shell public */}
      {appPublic.length > 0 && (
        <Route element={<AppLayout />}>
          {appPublic.map((r) => (
            <Route key={r.path} path={r.path} element={<RouteGuard route={r} />} />
          ))}
        </Route>
      )}

      {/* 4. App shell protected (resident pages) */}
      {appProtected.length > 0 && (
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            {appProtected.map((r) => (
              <Route key={r.path} path={r.path} element={<RouteGuard route={r} />} />
            ))}
          </Route>
        </Route>
      )}

      {/* 5. Admin shell protected */}
      {adminProtected.length > 0 && (
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            {adminProtected.map((r) => (
              <Route key={r.path} path={r.path} element={<RouteGuard route={r} />} />
            ))}
          </Route>
        </Route>
      )}

      {/* 6. Catch-all — unknown paths get a 404, no redirect loop */}
      <Route path="*" element={<NotFoundPage />} />

    </Routes>
  )
}
