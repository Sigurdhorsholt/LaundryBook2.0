import { Outlet, NavLink, useNavigate, useLocation, useMatch } from 'react-router-dom'
import { useEffect } from 'react'
import { useMeQuery } from '../features/auth/authApi'
import { routes } from '../app/routes'
import { isEnabled } from '../config/features'
import { getHighestRole } from './roleUtils'
import { colors } from './theme'
import { AppNavbar } from './AppNavbar'
import {
  IconUsers, IconSettings, IconBuilding, IconClock, IconCalendarCheck, IconCalendar,
  IconChevronLeft,
} from './icons'

interface SubNavSection {
  title: string
  items: { path: string; label: string; icon: React.ReactNode; feature?: keyof typeof import('../config/features').FEATURES }[]
}

// ── Property sub-nav definition ───────────────────────────────────────────────
function buildPropertySubNav(propertyId: string): SubNavSection[] {
  const base = `/admin/properties/${propertyId}`
  return [
    {
      title: 'Administration',
      items: [
        {
          path: `${base}/users`,
          label: 'Brugere',
          icon: <IconUsers size={15} />,
        },
        {
          path: `${base}/settings`,
          label: 'Indstillinger',
          icon: <IconSettings size={15} />,
        },
      ],
    },
    {
      title: 'Vaskerum',
      items: [
        {
          path: `${base}/laundry`,
          label: 'Lokaler & Maskiner',
          feature: 'laundryBooking' as const,
          icon: <IconBuilding size={15} />,
        },
        {
          path: `${base}/timeslots`,
          label: 'Tidspladser',
          feature: 'laundryBooking' as const,
          icon: <IconClock size={15} />,
        },
        {
          path: `${base}/bookings`,
          label: 'Bookinger',
          feature: 'laundryBooking' as const,
          icon: <IconCalendarCheck size={15} />,
        },
        {
          path: `${base}/preview`,
          label: 'Forhåndsvisning',
          feature: 'laundryBooking' as const,
          icon: <IconCalendar size={15} />,
        },
      ],
    },
  ]
}

// ── Nav item component ────────────────────────────────────────────────────────

function SidebarLink({
  to,
  icon,
  label,
  end = false,
}: {
  to: string
  icon?: React.ReactNode
  label: string
  end?: boolean
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `sidebar-link d-flex align-items-center gap-2 px-3 py-2 rounded-2 text-decoration-none fw-medium mb-1${isActive ? ' sidebar-link--active' : ''}`
      }
      style={{ fontSize: '0.875rem' }}
    >
      {icon && <span className="flex-shrink-0" style={{ opacity: 0.7, display: 'flex' }}>{icon}</span>}
      {label}
    </NavLink>
  )
}

function SidebarSectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="px-2 mb-1 mt-3 text-uppercase fw-semibold"
      style={{ fontSize: '0.67rem', letterSpacing: '0.09em', color: colors.textMuted }}
    >
      {children}
    </p>
  )
}

// ── Auto-close offcanvas on route change (mobile) ─────────────────────────────

function cleanupBootstrapOverlays() {
  document.querySelectorAll('.offcanvas-backdrop').forEach(el => el.remove())
  if (!document.querySelector('.offcanvas.show, .modal.show')) {
    document.body.classList.remove('modal-open')
    document.body.style.removeProperty('overflow')
    document.body.style.removeProperty('padding-right')
  }
}

function useSidebarAutoClose() {
  const location = useLocation()
  useEffect(() => {
    const el = document.getElementById('adminSidebar')
    if (!el || !el.classList.contains('show')) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const BS = (window as any).bootstrap
    if (!BS?.Offcanvas) return
    const instance = BS.Offcanvas.getInstance(el) ?? new BS.Offcanvas(el)
    instance.hide()
    // Fallback: Bootstrap sometimes fails to clean up when hide() is
    // triggered mid-animation — remove the backdrop element and body lock.
    const timer = setTimeout(cleanupBootstrapOverlays, 350)
    return () => clearTimeout(timer)
  }, [location.pathname])

  // When AdminLayout unmounts (switching to resident layout), the location
  // effect is skipped — run cleanup immediately so the sidebar backdrop and
  // body scroll lock don't persist on the new page.
  useEffect(() => {
    return cleanupBootstrapOverlays
  }, [])
}

// ── Main component ────────────────────────────────────────────────────────────

export function AdminLayout() {
  const navigate = useNavigate()
  const { data: user } = useMeQuery()
  useSidebarAutoClose()

  // Detect if we're inside a specific property's pages
  const propertyMatch = useMatch({ path: '/admin/properties/:propertyId', end: false })
  const activePropertyId = propertyMatch?.params.propertyId ?? null
  const activeProperty = activePropertyId
    ? user?.memberships.find((m) => m.propertyId === activePropertyId)
    : null

  const userRole = user ? getHighestRole(user) : null

  // Top-level sidebar items (only shown when NOT inside a property)
  // Filtered by feature flag and role so SysAdmin-only routes are hidden from lower roles
  const topLevelItems = routes.filter(
    (r) =>
      r.layout === 'admin' &&
      r.label &&
      (!r.feature || isEnabled(r.feature)) &&
      (r.minRole === undefined || (userRole !== null && userRole >= r.minRole))
  )

  // Property sub-nav sections (shown when inside a property)
  const propertySubNav = activePropertyId ? buildPropertySubNav(activePropertyId) : []

  return (
    <div className="d-flex flex-column min-vh-100">

      <AppNavbar isAdmin />

      {/* ── Sidebar + content ────────────────────────────────────────────────── */}
      <div className="d-flex flex-grow-1" style={{ minHeight: 0 }}>

        {/* Sidebar — offcanvas-lg: static on ≥lg, slide-in panel on <lg */}
        <div
          className="offcanvas-lg offcanvas-start flex-shrink-0 bg-white border-end d-flex flex-column"
          id="adminSidebar"
          tabIndex={-1}
          aria-labelledby="adminSidebarLabel"
          style={{ width: 256 }}
        >
          {/* Mobile offcanvas header */}
          <div className="offcanvas-header d-lg-none border-bottom px-4 py-3">
            <span id="adminSidebarLabel" className="fw-bold" style={{ color: colors.textPrimary }}>Menu</span>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="offcanvas"
              data-bs-target="#adminSidebar"
              aria-label="Luk"
            />
          </div>

          {/* Nav body */}
          <div className="offcanvas-body p-0 d-flex flex-column" style={{ overflowY: 'auto' }}>
            <nav className="p-3 flex-grow-1">

              {activePropertyId ? (
                // ── Property context nav ────────────────────────────────────
                <>
                  {/* Back to properties */}
                  <button
                    className="sidebar-back-btn d-flex align-items-center gap-2 px-3 py-2 rounded-2 border-0 bg-transparent fw-medium mb-3 w-100 text-start"
                    style={{ fontSize: '0.82rem', color: colors.textSecondary, cursor: 'pointer' }}
                    onClick={() => navigate('/admin/properties')}
                  >
                    <IconChevronLeft size={14} strokeWidth={2.5} />
                    Alle ejendomme
                  </button>

                  {/* Property name */}
                  <div className="px-3 py-2 mb-1 rounded-2" style={{ backgroundColor: colors.bgPage, border: `1px solid ${colors.borderDefault}` }}>
                    <p className="mb-0 text-truncate fw-semibold" style={{ fontSize: '0.88rem', color: colors.textPrimary }}>
                      {activeProperty?.propertyName ?? 'Ejendom'}
                    </p>
                  </div>

                  {/* Grouped sub-nav */}
                  {propertySubNav.map((section) => (
                    <div key={section.title}>
                      <SidebarSectionLabel>{section.title}</SidebarSectionLabel>
                      {section.items
                        .filter((item) => !item.feature || isEnabled(item.feature))
                        .map((item) => (
                          <SidebarLink key={item.path} to={item.path} icon={item.icon} label={item.label} />
                        ))}
                    </div>
                  ))}
                </>
              ) : (
                // ── Main admin nav ──────────────────────────────────────────
                <>
                  <SidebarSectionLabel>Oversigt</SidebarSectionLabel>
                  {topLevelItems.map((route) => (
                    <SidebarLink
                      key={route.path}
                      to={route.path}
                      icon={route.icon}
                      label={route.label!}
                      end={route.path === '/admin'}
                    />
                  ))}
                </>
              )}

            </nav>

            {/* Sidebar footer — desktop only */}
            <div className="px-4 py-3 border-top d-none d-lg-block" style={{ borderColor: colors.borderDefault }}>
              <p className="mb-0 text-truncate" style={{ fontSize: '0.75rem', color: colors.textMuted }}>
                {user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Main content area — Outlet swaps here */}
        <main
          className="flex-grow-1"
          style={{ minWidth: 0, overflowX: 'hidden', backgroundColor: colors.bgPage }}
        >
          <Outlet />
        </main>

      </div>
    </div>
  )
}
