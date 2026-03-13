import { Routes, Route } from 'react-router-dom'
import { routes } from '../app/routes'
import { isEnabled } from '../config/features'
import { ProtectedRoute } from './ProtectedRoute'
import { AppLayout } from './AppLayout'
import { NotFoundPage } from '../pages/NotFoundPage'
import type { AppRoute } from '../app/routes'

/**
 * Renders a single route's component, guarded by its feature flag.
 * If the feature is disabled the route returns a 404 instead of breaking.
 */
function RouteElement({ route }: { route: AppRoute }) {
  if (route.feature && !isEnabled(route.feature)) {
    return <NotFoundPage />
  }
  return <route.component />
}

/**
 * Builds the full route tree from the central route config.
 *
 * Route groups (in render order):
 *   1. Bare public       — no shell, no auth
 *   2. App shell public  — persistent navbar, no auth  (rare, but supported)
 *   3. Bare protected    — no shell, auth required     (rare, but supported)
 *   4. App shell protected — persistent navbar + auth  (most app pages)
 *   5. Catch-all 404
 */
export function AppRouter() {
  const barePublic      = routes.filter((r) => r.layout === 'bare' && !r.protected)
  const appPublic       = routes.filter((r) => r.layout === 'app'  && !r.protected)
  const bareProtected   = routes.filter((r) => r.layout === 'bare' && r.protected)
  const appProtected    = routes.filter((r) => r.layout === 'app'  && r.protected)

  return (
    <Routes>

      {/* 1. Bare public (landing, login, …) */}
      {barePublic.map((r) => (
        <Route key={r.path} path={r.path} element={<RouteElement route={r} />} />
      ))}

      {/* 2. App shell public */}
      {appPublic.length > 0 && (
        <Route element={<AppLayout />}>
          {appPublic.map((r) => (
            <Route key={r.path} path={r.path} element={<RouteElement route={r} />} />
          ))}
        </Route>
      )}

      {/* 3. Bare protected */}
      {bareProtected.length > 0 && (
        <Route element={<ProtectedRoute />}>
          {bareProtected.map((r) => (
            <Route key={r.path} path={r.path} element={<RouteElement route={r} />} />
          ))}
        </Route>
      )}

      {/* 4. App shell protected (most pages live here) */}
      {appProtected.length > 0 && (
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            {appProtected.map((r) => (
              <Route key={r.path} path={r.path} element={<RouteElement route={r} />} />
            ))}
          </Route>
        </Route>
      )}

      {/* 5. Catch-all — unknown paths get a 404, not a redirect */}
      <Route path="*" element={<NotFoundPage />} />

    </Routes>
  )
}
