import type { ComponentType, ReactNode } from 'react'
import type { FeatureKey } from '../config/features'
import { UserRole } from '../features/auth/authApi'

import { LandingPage } from '../pages/LandingPage'
import { LoginPage } from '../pages/LoginPage'
import { SmartRedirectPage } from '../pages/SmartRedirectPage'
import { LaundryPage } from '../pages/laundry/LaundryPage'
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage'
import { PropertiesPage } from '../pages/admin/properties/PropertiesPage'
import { PropertyRedirectPage } from '../pages/admin/properties/PropertyRedirectPage'
import { PropertyUsersPage } from '../pages/admin/properties/PropertyUsersPage'
import { PropertySettingsPage } from '../pages/admin/properties/PropertySettingsPage'
import { LaundryRoomsPage } from '../pages/admin/properties/LaundryRoomsPage'
import { PropertyTimeslotsPage } from '../pages/admin/properties/PropertyTimeslotsPage'
import { PropertyBookingsPage } from '../pages/admin/properties/PropertyBookingsPage'

export interface AppRoute {
  path: string
  component: ComponentType
  layout: 'app' | 'admin' | 'bare'
  protected: boolean
  minRole?: UserRole
  feature?: FeatureKey
  /** Shown in top-level sidebar nav when set */
  label?: string
  icon?: ReactNode
}

// ── Shared inline SVG icons ──────────────────────────────────────────────────
const Icon = {
  grid: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
    </svg>
  ),
  building: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  calendar: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
}

export const routes: AppRoute[] = [

  // ── Public / bare ───────────────────────────────────────────────────────────
  { path: '/',     component: LandingPage,       layout: 'bare', protected: false },
  { path: '/login', component: LoginPage,          layout: 'bare', protected: false },
  { path: '/dashboard', component: SmartRedirectPage, layout: 'bare', protected: true },

  // ── Resident shell ──────────────────────────────────────────────────────────
  {
    path: '/laundry',
    component: LaundryPage,
    layout: 'app',
    protected: true,
    minRole: UserRole.Resident,
    feature: 'laundryBooking',
    label: 'Vaskebooking',
    icon: Icon.calendar,
  },

  // ── Admin shell — top-level pages (appear in main sidebar nav) ──────────────
  {
    path: '/admin',
    component: AdminDashboardPage,
    layout: 'admin',
    protected: true,
    minRole: UserRole.ComplexAdmin,
    label: 'Oversigt',
    icon: Icon.grid,
  },
  {
    path: '/admin/properties',
    component: PropertiesPage,
    layout: 'admin',
    protected: true,
    minRole: UserRole.ComplexAdmin,
    label: 'Ejendomme',
    icon: Icon.building,
  },

  // ── Admin shell — property sub-pages (no label = not in top nav) ────────────
  // These render inside AdminLayout but the sidebar switches to property context nav.
  {
    path: '/admin/properties/:propertyId',
    component: PropertyRedirectPage,
    layout: 'admin',
    protected: true,
    minRole: UserRole.ComplexAdmin,
  },
  {
    path: '/admin/properties/:propertyId/users',
    component: PropertyUsersPage,
    layout: 'admin',
    protected: true,
    minRole: UserRole.ComplexAdmin,
  },
  {
    path: '/admin/properties/:propertyId/settings',
    component: PropertySettingsPage,
    layout: 'admin',
    protected: true,
    minRole: UserRole.ComplexAdmin,
  },
  {
    path: '/admin/properties/:propertyId/laundry',
    component: LaundryRoomsPage,
    layout: 'admin',
    protected: true,
    minRole: UserRole.ComplexAdmin,
    feature: 'laundryBooking',
  },
  {
    path: '/admin/properties/:propertyId/timeslots',
    component: PropertyTimeslotsPage,
    layout: 'admin',
    protected: true,
    minRole: UserRole.ComplexAdmin,
    feature: 'laundryBooking',
  },
  {
    path: '/admin/properties/:propertyId/bookings',
    component: PropertyBookingsPage,
    layout: 'admin',
    protected: true,
    minRole: UserRole.ComplexAdmin,
    feature: 'laundryBooking',
  },
]
