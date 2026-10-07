import { lazy, type ComponentType, type ReactNode } from 'react'
import type { FeatureKey } from '../config/features'
import { UserRole } from '../features/auth/authApi'
import { IconGrid, IconBuilding, IconCalendar, IconShield, IconUsers } from '../shared/icons'

import { LandingPage } from '../pages/LandingPage'
import { SmartRedirectPage } from '../pages/SmartRedirectPage'
import { LaundryPage } from '../pages/laundry/LaundryPage'

// Split per page so residents and first-time visitors don't download the admin/sysadmin code
const FeaturesPage = lazy(() => import('../pages/public/FeaturesPage').then((m) => ({ default: m.FeaturesPage })))
const DemoPage = lazy(() => import('../pages/public/DemoPage').then((m) => ({ default: m.DemoPage })))
const FaqPage = lazy(() => import('../pages/public/FaqPage').then((m) => ({ default: m.FaqPage })))
const AboutPage = lazy(() => import('../pages/public/AboutPage').then((m) => ({ default: m.AboutPage })))
const PrivacyPage = lazy(() => import('../pages/public/PrivacyPage').then((m) => ({ default: m.PrivacyPage })))
const TermsPage = lazy(() => import('../pages/public/TermsPage').then((m) => ({ default: m.TermsPage })))
const GetStartedPage = lazy(() => import('../pages/public/GetStartedPage').then((m) => ({ default: m.GetStartedPage })))
const MyPage = lazy(() => import('../pages/MyPage').then((m) => ({ default: m.MyPage })))
const JoinPage = lazy(() => import('../pages/JoinPage').then((m) => ({ default: m.JoinPage })))
const SignupPage = lazy(() => import('../pages/SignupPage').then((m) => ({ default: m.SignupPage })))
const AdminDashboardPage = lazy(() => import('../pages/admin/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })))
const PropertiesPage = lazy(() => import('../pages/admin/properties/PropertiesPage').then((m) => ({ default: m.PropertiesPage })))
const PropertyOverviewPage = lazy(() => import('../pages/admin/properties/PropertyOverviewPage').then((m) => ({ default: m.PropertyOverviewPage })))
const PropertyUsersPage = lazy(() => import('../pages/admin/properties/PropertyUsersPage').then((m) => ({ default: m.PropertyUsersPage })))
const PropertySettingsPage = lazy(() => import('../pages/admin/properties/PropertySettingsPage').then((m) => ({ default: m.PropertySettingsPage })))
const LaundryRoomsPage = lazy(() => import('../pages/admin/properties/LaundryRoomsPage').then((m) => ({ default: m.LaundryRoomsPage })))
const PropertyTimeslotsPage = lazy(() => import('../pages/admin/properties/PropertyTimeslotsPage').then((m) => ({ default: m.PropertyTimeslotsPage })))
const PropertyBookingsPage = lazy(() => import('../pages/admin/properties/PropertyBookingsPage').then((m) => ({ default: m.PropertyBookingsPage })))
const SysAdminPage = lazy(() => import('../pages/admin/SysAdminPage').then((m) => ({ default: m.SysAdminPage })))

export interface AppRoute {
  path: string
  component: ComponentType
  layout: 'app' | 'admin' | 'bare'
  protected: boolean
  minRole?: UserRole
  feature?: FeatureKey
  /** i18n key for the label shown in top-level sidebar nav when set */
  label?: string
  icon?: ReactNode
}

export const routes: AppRoute[] = [

  // ── Public / bare ───────────────────────────────────────────────────────────
  { path: '/',          component: LandingPage,   layout: 'bare', protected: false },
  { path: '/features',  component: FeaturesPage,  layout: 'bare', protected: false },
  { path: '/demo',      component: DemoPage,      layout: 'bare', protected: false },
  { path: '/faq',       component: FaqPage,       layout: 'bare', protected: false },
  { path: '/om',        component: AboutPage,     layout: 'bare', protected: false },
  { path: '/privatliv', component: PrivacyPage,   layout: 'bare', protected: false },
  { path: '/vilkaar',   component: TermsPage,     layout: 'bare', protected: false },
  { path: '/get-started', component: GetStartedPage, layout: 'bare', protected: false },
  { path: '/signup',    component: SignupPage,    layout: 'bare', protected: false },
  { path: '/join',      component: JoinPage,      layout: 'bare', protected: false },
  { path: '/dashboard', component: SmartRedirectPage,    layout: 'bare', protected: true },

  // ── Resident shell ──────────────────────────────────────────────────────────
  {
    path: '/laundry',
    component: LaundryPage,
    layout: 'app',
    protected: true,
    minRole: UserRole.Resident,
    feature: 'laundryBooking',
    label: 'nav.laundry',
    icon: <IconCalendar />,
  },

  {
    path: '/my-page',
    component: MyPage,
    layout: 'app',
    protected: true,
    minRole: UserRole.Resident,
    label: 'nav.myPage',
    icon: <IconUsers />,
  },

  // ── Admin shell — top-level pages (appear in main sidebar nav) ──────────────
  {
    path: '/admin',
    component: AdminDashboardPage,
    layout: 'admin',
    protected: true,
    minRole: UserRole.ComplexAdmin,
    label: 'nav.overview',
    icon: <IconGrid />,
  },
  {
    path: '/admin/properties',
    component: PropertiesPage,
    layout: 'admin',
    protected: true,
    minRole: UserRole.ComplexAdmin,
    label: 'nav.properties',
    icon: <IconBuilding />,
  },

  // ── Admin shell — SysAdmin-only pages ──────────────────────────────────────
  {
    path: '/admin/system',
    component: SysAdminPage,
    layout: 'admin',
    protected: true,
    minRole: UserRole.SysAdmin,
    label: 'nav.system',
    icon: <IconShield />,
  },

  // ── Admin shell — property sub-pages (no label = not in top nav) ────────────
  // These render inside AdminLayout but the sidebar switches to property context nav.
  {
    path: '/admin/properties/:propertyId',
    component: PropertyOverviewPage,
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
