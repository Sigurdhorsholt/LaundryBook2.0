import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { firebaseAuth } from '../lib/firebase'
import { useMeQuery, useLogoutMutation } from '../features/auth/authApi'
import { routes } from '../app/routes'
import { isEnabled } from '../config/features'

export function AppLayout() {
  const navigate = useNavigate()
  const { data: user } = useMeQuery()
  const [logout] = useLogoutMutation()

  // Only show nav items that are app-layout routes with a label and an enabled feature
  const navItems = routes.filter(
    (r) => r.layout === 'app' && r.label && (!r.feature || isEnabled(r.feature))
  )

  async function handleLogout() {
    await logout()
    await signOut(firebaseAuth)
    navigate('/', { replace: true })
  }

  return (
    <div className="d-flex flex-column min-vh-100">

      {/* ── Persistent navbar ── */}
      <nav
        className="navbar navbar-expand-lg sticky-top border-bottom"
        style={{ backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)' }}
      >
        <div className="container-xl px-4">

          {/* Brand */}
          <NavLink
            to="/laundry"
            className="navbar-brand d-flex align-items-center gap-2 fw-bold text-decoration-none"
            style={{ color: '#0d1b2a', fontSize: '1.1rem', letterSpacing: '-0.2px' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1565c0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="4" />
              <path d="M2 12h3M19 12h3M12 2v3M12 19v3" />
            </svg>
            LaundryBook
          </NavLink>

          {/* Mobile toggle */}
          <button
            className="navbar-toggler border-0"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#appNav"
            aria-controls="appNav"
            aria-expanded="false"
            aria-label="Åbn menu"
          >
            <span className="navbar-toggler-icon" />
          </button>

          {/* Collapsible content */}
          <div className="collapse navbar-collapse" id="appNav">

            {/* Nav links */}
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              {navItems.map((route) => (
                <li key={route.path} className="nav-item">
                  <NavLink
                    to={route.path}
                    className={({ isActive }) =>
                      `nav-link fw-medium ${isActive ? 'text-primary' : 'text-secondary'}`
                    }
                    style={{ fontSize: '0.9rem' }}
                  >
                    {route.label}
                  </NavLink>
                </li>
              ))}
            </ul>

            {/* User + logout */}
            <div className="d-flex align-items-center gap-3">
              {user && (
                <span
                  className="d-none d-md-inline text-truncate"
                  style={{ color: '#5a6a7a', fontSize: '0.85rem', maxWidth: 200 }}
                >
                  {user.email}
                </span>
              )}
              <button
                className="btn btn-outline-secondary btn-sm"
                style={{ borderRadius: '7px', fontSize: '0.85rem' }}
                onClick={handleLogout}
              >
                Log ud
              </button>
            </div>

          </div>
        </div>
      </nav>

      {/* ── Page content (swaps on navigation) ── */}
      <main className="flex-grow-1">
        <Outlet />
      </main>

    </div>
  )
}
