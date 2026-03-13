import type { ComponentType } from 'react'
import type { FeatureKey } from '../config/features'

import { LandingPage } from '../pages/LandingPage'
import { LoginPage } from '../pages/LoginPage'
import { DashboardPage } from '../pages/DashboardPage'

/**
 * layout:
 *   'bare'  — no persistent shell (landing page, login, etc.)
 *   'app'   — wrapped in AppLayout (sticky navbar + main content area)
 *
 * protected:
 *   true  — redirects to /login if not authenticated
 *   false — publicly accessible
 *
 * feature:
 *   optional — if the named feature flag is disabled the route serves a 404
 */
export interface AppRoute {
  path: string
  component: ComponentType
  layout: 'app' | 'bare'
  protected: boolean
  feature?: FeatureKey
  /** Display label used in nav menus */
  label?: string
}

export const routes: AppRoute[] = [
  // ── Public / bare ──────────────────────────────────────────
  {
    path: '/',
    component: LandingPage,
    layout: 'bare',
    protected: false,
  },
  {
    path: '/login',
    component: LoginPage,
    layout: 'bare',
    protected: false,
  },

  // ── App shell (protected) ───────────────────────────────────
  {
    path: '/dashboard',
    component: DashboardPage,
    layout: 'app',
    protected: true,
    label: 'Oversigt',
  },

  // Future modules — add here when ready:
  // {
  //   path: '/laundry',
  //   component: LaundryPage,
  //   layout: 'app',
  //   protected: true,
  //   feature: 'laundryBooking',
  //   label: 'Vaskebooking',
  // },
]
