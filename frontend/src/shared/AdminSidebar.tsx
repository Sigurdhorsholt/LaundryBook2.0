import { useEffect } from 'react'
import { useNavigate, useMatch } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMeQuery } from '../features/auth/authApi'
import { useActiveProperty } from '../features/properties/useActiveProperty'
import { AdminPropertySwitcher } from './AdminPropertySwitcher'
import { routes } from '../app/routes'
import { isEnabled, type FeatureKey } from '../config/features'
import { getHighestRole } from './roleUtils'
import { useRoleLabel } from './constants'
import { colors } from './theme'
import { userInitials } from './utils/formatUtils'
import { SidebarLink, SidebarSectionLabel } from './AdminSidebarLink'
import {
  IconUsers, IconSettings, IconBuilding, IconClock, IconCalendarCheck, IconCalendar, IconUser, IconGrid, IconFileText,
  IconChevronLeft,
} from './icons'

interface SubNavSection {
  title: string
  items: { path: string; label: string; icon: React.ReactNode; feature?: FeatureKey }[]
}

// title/label hold i18n keys, resolved at render time
function buildPropertySubNav(propertyId: string): SubNavSection[] {
  const base = `/admin/properties/${propertyId}`
  return [
    {
      title: 'nav.sectionLaundry',
      items: [
        { path: `${base}/laundry`, label: 'nav.roomsAndMachines', feature: 'laundryBooking', icon: <IconBuilding size={15} /> },
        { path: `${base}/timeslots`, label: 'nav.timeslots', feature: 'laundryBooking', icon: <IconClock size={15} /> },
        { path: `${base}/bookings`, label: 'nav.bookings', feature: 'laundryBooking', icon: <IconCalendarCheck size={15} /> },
      ],
    },
    {
      title: 'nav.sectionAdministration',
      items: [
        { path: `${base}/users`, label: 'nav.users', icon: <IconUsers size={15} /> },
        { path: `${base}/house-rules`, label: 'nav.houseRules', icon: <IconFileText size={15} /> },
        { path: `${base}/settings`, label: 'nav.settings', icon: <IconSettings size={15} /> },
      ],
    },
  ]
}

export function AdminSidebar() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  // nav labels come from route/sub-nav config as runtime i18n-key strings
  const tx = t as (key: string) => string
  const roleLabel = useRoleLabel()
  const { data: user } = useMeQuery()

  const propertyMatch = useMatch({ path: '/admin/properties/:propertyId', end: false })
  const activePropertyId = propertyMatch?.params.propertyId ?? null
  const isMember = !!activePropertyId && !!user?.memberships.some((m) => m.propertyId === activePropertyId)
  const userRole = user ? getHighestRole(user) : null
  const { membership: residentProperty, select } = useActiveProperty()
  const alreadyActive = residentProperty?.propertyId === activePropertyId

  // "Vaskebooking" and "Min side" below should open the property the admin is working on
  useEffect(() => {
    if (activePropertyId && isMember && !alreadyActive) select(activePropertyId)
  }, [activePropertyId, isMember, alreadyActive, select])

  // Filtered by feature flag and role so SysAdmin-only routes are hidden from lower roles
  const topLevelItems = routes.filter(
    (r) =>
      r.layout === 'admin' &&
      r.label &&
      (!r.feature || isEnabled(r.feature)) &&
      (r.minRole === undefined || (userRole !== null && userRole >= r.minRole))
  )
  const propertySubNav = activePropertyId ? buildPropertySubNav(activePropertyId) : []

  return (
    <div
      className="offcanvas-lg offcanvas-start flex-shrink-0 d-flex flex-column admin-sidebar"
      id="adminSidebar"
      tabIndex={-1}
      aria-labelledby="adminSidebarLabel"
      style={{ width: 260, color: colors.chromeText }}
    >
      <div className="offcanvas-header d-lg-none px-4 py-3" style={{ borderBottom: `1px solid ${colors.chromeRaised}` }}>
        <span id="adminSidebarLabel" className="fw-bold" style={{ color: colors.bgCard }}>{t('nav.menu')}</span>
        <button type="button" className="btn-close btn-close-white" data-bs-dismiss="offcanvas" data-bs-target="#adminSidebar" aria-label={t('common.close')} />
      </div>

      <div className="offcanvas-body p-0 d-flex flex-column" style={{ overflowY: 'auto' }}>
        <nav className="p-3 flex-grow-1">
          {activePropertyId ? (
            <>
              <button
                className="sidebar-back-btn d-flex align-items-center gap-2 px-3 py-2 rounded-2 border-0 bg-transparent fw-medium mb-3 w-100 text-start"
                style={{ fontSize: '0.82rem', color: colors.chromeText, cursor: 'pointer', minHeight: 40 }}
                onClick={() => navigate('/admin/properties')}
              >
                <IconChevronLeft size={14} strokeWidth={2.5} />
                {t('nav.allProperties')}
              </button>

              <AdminPropertySwitcher propertyId={activePropertyId} />

              <div className="mt-2">
                <SidebarLink to={`/admin/properties/${activePropertyId}`} end icon={<IconGrid size={15} />} label={t('nav.overview')} />
              </div>

              {propertySubNav.map((section) => (
                <div key={section.title}>
                  <SidebarSectionLabel>{tx(section.title)}</SidebarSectionLabel>
                  {section.items
                    .filter((item) => !item.feature || isEnabled(item.feature))
                    .map((item) => (
                      <SidebarLink key={item.path} to={item.path} icon={item.icon} label={tx(item.label)} />
                    ))}
                </div>
              ))}
            </>
          ) : (
            <>
              <SidebarSectionLabel>{t('nav.overview')}</SidebarSectionLabel>
              {topLevelItems.map((route) => (
                <SidebarLink key={route.path} to={route.path} icon={route.icon} label={tx(route.label!)} end={route.path === '/admin'} />
              ))}
            </>
          )}

          {/* Admins are residents too; on a phone the header has no room for these links */}
          <SidebarSectionLabel>{t('nav.sectionResident')}</SidebarSectionLabel>
          <SidebarLink to="/laundry" icon={<IconCalendar size={15} />} label={t('nav.laundry')} />
          <SidebarLink to="/my-page" icon={<IconUser size={15} />} label={t('nav.myPage')} />
        </nav>

        {user && (
          <div className="d-flex align-items-center gap-2 px-3 py-3" style={{ borderTop: `1px solid ${colors.chromeRaised}` }}>
            <span
              aria-hidden="true"
              style={{
                width: 34, height: 34, borderRadius: '50%', flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: colors.chromeAccent, color: colors.chrome, fontWeight: 700, fontSize: '0.75rem',
              }}
            >
              {userInitials(user)}
            </span>
            <span style={{ minWidth: 0 }}>
              <span className="d-block text-truncate fw-semibold" style={{ fontSize: '0.85rem', color: colors.bgCard }}>
                {[user.firstName, user.lastName].filter(Boolean).join(' ') || user.email}
              </span>
              {userRole !== null && (
                <span className="d-block" style={{ fontSize: '0.75rem', color: colors.chromeMuted }}>{roleLabel(userRole)}</span>
              )}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
