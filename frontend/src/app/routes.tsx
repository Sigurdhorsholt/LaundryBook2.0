import type { ComponentType, ReactNode } from 'react'
import type { FeatureKey } from '../config/features'
import { UserRole } from '../features/auth/authApi'
import { IconGrid, IconBuilding, IconCalendar, IconShield } from '../shared/icons'

import { LandingPage } from '../pages/LandingPage'
import { JoinPage } from '../pages/JoinPage'
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
import { BookingPreviewPage } from '../pages/admin/properties/BookingPreviewPage'
import { SysAdminPage } from '../pages/admin/SysAdminPage'

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

export const routes: AppRoute[] = [

  // ── Public / bare ───────────────────────────────────────────────────────────
  { path: '/',          component: LandingPage,          layout: 'bare', protected: false },
  { path: '/join',      component: JoinPage,             layout: 'bare', protected: false },
  { path: '/dashboard', component: SmartRedirectPage,    layout: 'bare', protected: true },

  // ── Resident shell ──────────────────────────────────────────────────────────
  {
    path: '/laundry',
    component: LaundryPage,
    layout: 'app',
    protected: true,
    minRole: UserRole.Resident,
    feature: 'laundryBooking',
    label: 'Vaskebooking',
    icon: <IconCalendar />,
  },

  // ── Admin shell — top-level pages (appear in main sidebar nav) ──────────────
  {
    path: '/admin',
    component: AdminDashboardPage,
    layout: 'admin',
    protected: true,
    minRole: UserRole.ComplexAdmin,
    label: 'Oversigt',
    icon: <IconGrid />,
  },
  {
    path: '/admin/properties',
    component: PropertiesPage,
    layout: 'admin',
    protected: true,
    minRole: UserRole.ComplexAdmin,
    label: 'Ejendomme',
    icon: <IconBuilding />,
  },

  // ── Admin shell — SysAdmin-only pages ──────────────────────────────────────
  {
    path: '/admin/system',
    component: SysAdminPage,
    layout: 'admin',
    protected: true,
    minRole: UserRole.SysAdmin,
    label: 'System',
    icon: <IconShield />,
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
  {
    path: '/admin/properties/:propertyId/preview',
    component: BookingPreviewPage,
    layout: 'admin',
    protected: true,
    minRole: UserRole.ComplexAdmin,
    feature: 'laundryBooking',
  },
]
