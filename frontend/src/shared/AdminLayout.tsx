import { Outlet, NavLink, useNavigate, useLocation, useMatch } from 'react-router-dom'
import { useEffect } from 'react'
import { signOut } from 'firebase/auth'
import { firebaseAuth } from '../lib/firebase'
import { useMeQuery, useLogoutMutation, UserRole } from '../features/auth/authApi'
import { routes } from '../app/routes'
import { isEnabled } from '../config/features'
import { getHighestRole } from './roleUtils'

// ── Types ────────────────────────────────────────────────────────────────────

const roleLabel: Partial<Record<UserRole, string>> = {
  [UserRole.ComplexAdmin]: 'Ejendomsadmin',
  [UserRole.OrgAdmin]: 'Organisationsadmin',
  [UserRole.SysAdmin]: 'Systemadmin',
}

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
          icon: (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          ),
        },
        {
          path: `${base}/settings`,
          label: 'Indstillinger',
          icon: (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
              <path d="M12 2v2M12 20v2M2 12h2M20 12h2"/>
            </svg>
          ),
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
          icon: (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          ),
        },
        {
          path: `${base}/timeslots`,
          label: 'Tidspladser',
          feature: 'laundryBooking' as const,
          icon: (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          ),
        },
        {
          path: `${base}/bookings`,
          label: 'Bookinger',
          feature: 'laundryBooking' as const,
          icon: (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
              <path d="M9 16l2 2 4-4"/>
            </svg>
          ),
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
      className="d-flex align-items-center gap-2 px-3 py-2 rounded-2 text-decoration-none fw-medium mb-1"
      style={({ isActive }) => ({
        fontSize: '0.875rem',
        color: isActive ? '#1565c0' : '#4a5568',
        backgroundColor: isActive ? '#e8f0fe' : 'transparent',
        transition: 'background-color 0.15s, color 0.15s',
      })}
      onMouseEnter={(e) => {
        const el = e.currentTarget
        if (!el.style.backgroundColor.includes('e8f0fe')) el.style.backgroundColor = '#f5f7fa'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget
        if (!el.style.backgroundColor.includes('e8f0fe')) el.style.backgroundColor = 'transparent'
      }}
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
      style={{ fontSize: '0.67rem', letterSpacing: '0.09em', color: '#b0bec5' }}
    >
      {children}
    </p>
  )
}

// ── Auto-close offcanvas on route change (mobile) ─────────────────────────────

function useSidebarAutoClose() {
  const location = useLocation()
  useEffect(() => {
    const el = document.getElementById('adminSidebar')
    if (!el) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const instance = (window as any).bootstrap?.Offcanvas?.getInstance(el)
    instance?.hide()
  }, [location.pathname])
}

// ── Main component ────────────────────────────────────────────────────────────

export function AdminLayout() {
  const navigate = useNavigate()
  const { data: user } = useMeQuery()
  const [logout] = useLogoutMutation()
  useSidebarAutoClose()

  const role = user ? getHighestRole(user) : null

  // Detect if we're inside a specific property's pages
  const propertyMatch = useMatch({ path: '/admin/properties/:propertyId', end: false })
  const activePropertyId = propertyMatch?.params.propertyId ?? null
  const activeProperty = activePropertyId
    ? user?.memberships.find((m) => m.propertyId === activePropertyId)
    : null

  // Top-level sidebar items (only shown when NOT inside a property)
  const topLevelItems = routes.filter(
    (r) => r.layout === 'admin' && r.label && (!r.feature || isEnabled(r.feature))
  )

  // Property sub-nav sections (shown when inside a property)
  const propertySubNav = activePropertyId ? buildPropertySubNav(activePropertyId) : []

  async function handleLogout() {
    await logout()
    await signOut(firebaseAuth)
    navigate('/', { replace: true })
  }

  return (
    <div className="d-flex flex-column min-vh-100">

      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <nav
        className="navbar sticky-top border-bottom flex-shrink-0"
        style={{ backgroundColor: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(10px)', zIndex: 1040 }}
      >
        <div className="container-fluid px-3 px-lg-4">

          {/* Mobile hamburger */}
          <button
            className="btn d-lg-none p-2 me-1"
            style={{ color: '#5a6a7a' }}
            type="button"
            data-bs-toggle="offcanvas"
            data-bs-target="#adminSidebar"
            aria-controls="adminSidebar"
            aria-label="Åbn menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>

          {/* Brand */}
          <NavLink
            to="/admin"
            className="navbar-brand d-flex align-items-center gap-2 fw-bold text-decoration-none me-auto"
            style={{ color: '#0d1b2a', fontSize: '1.05rem', letterSpacing: '-0.2px' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1565c0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/>
              <path d="M2 12h3M19 12h3M12 2v3M12 19v3"/>
            </svg>
            LaundryBook
            <span
              className="d-none d-sm-inline badge ms-1"
              style={{ backgroundColor: '#e8f0fe', color: '#1565c0', fontSize: '0.7rem', fontWeight: 600 }}
            >
              Admin
            </span>
          </NavLink>

          {/* User info + logout */}
          <div className="d-flex align-items-center gap-2 gap-sm-3">
            <div className="d-none d-md-flex flex-column align-items-end" style={{ lineHeight: 1.25 }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0d1b2a' }}>
                {user?.firstName ? `${user.firstName} ${user.lastName}` : user?.email}
              </span>
              {role !== null && (
                <span style={{ fontSize: '0.72rem', color: '#5a6a7a' }}>{roleLabel[role] ?? ''}</span>
              )}
            </div>
            <button
              className="btn btn-outline-secondary btn-sm"
              style={{ borderRadius: '7px', fontSize: '0.82rem', whiteSpace: 'nowrap' }}
              onClick={handleLogout}
            >
              Log ud
            </button>
          </div>

        </div>
      </nav>

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
            <span id="adminSidebarLabel" className="fw-bold" style={{ color: '#0d1b2a' }}>Menu</span>
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
                    className="d-flex align-items-center gap-2 px-3 py-2 rounded-2 border-0 bg-transparent fw-medium mb-3 w-100 text-start"
                    style={{ fontSize: '0.82rem', color: '#5a6a7a', cursor: 'pointer' }}
                    onClick={() => navigate('/admin/properties')}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = '#f5f7fa')}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = 'transparent')}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="15 18 9 12 15 6"/>
                    </svg>
                    Alle ejendomme
                  </button>

                  {/* Property name */}
                  <div className="px-3 py-2 mb-1 rounded-2" style={{ backgroundColor: '#f8fafb', border: '1px solid #e8ecf0' }}>
                    <p className="mb-0 text-truncate fw-semibold" style={{ fontSize: '0.88rem', color: '#0d1b2a' }}>
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
            <div className="px-4 py-3 border-top d-none d-lg-block" style={{ borderColor: '#e8ecf0' }}>
              <p className="mb-0 text-truncate" style={{ fontSize: '0.75rem', color: '#b0bec5' }}>
                {user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Main content area — Outlet swaps here */}
        <main
          className="flex-grow-1"
          style={{ minWidth: 0, overflowX: 'hidden', backgroundColor: '#f8fafb' }}
        >
          <Outlet />
        </main>

      </div>
    </div>
  )
}
