import { useState, useEffect } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { signOut } from 'firebase/auth'
import { firebaseAuth } from '../lib/firebase'
import { useMeQuery, useLogoutMutation } from '../features/auth/authApi'
import { baseApi } from '../app/baseApi'
import { routes } from '../app/routes'
import { isEnabled } from '../config/features'

const BrandLogo = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1565c0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="4" />
    <path d="M2 12h3M19 12h3M12 2v3M12 19v3" />
  </svg>
)

export function AppNavbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { data: user } = useMeQuery()
  const [logout] = useLogoutMutation()
  const dispatch = useDispatch()
  const [open, setOpen] = useState(false)

  useEffect(() => { setOpen(false) }, [location.pathname])

  const navItems = routes.filter(
    (r) => r.layout === 'app' && r.label && (!r.feature || isEnabled(r.feature))
  )

  async function handleLogout() {
    await logout()
    await signOut(firebaseAuth)
    dispatch(baseApi.util.resetApiState())
    navigate('/', { replace: true })
  }

  return (
    <nav
      className="sticky-top border-bottom"
      style={{ backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', zIndex: 1030 }}
    >
      {/* ── Top row: brand + toggle ── */}
      <div className="container-xl px-4 d-flex align-items-center" style={{ height: 56 }}>
        <NavLink
          to="/laundry"
          className="d-flex align-items-center gap-2 fw-bold text-decoration-none me-auto"
          style={{ color: '#0d1b2a', fontSize: '1.1rem', letterSpacing: '-0.2px' }}
        >
          <BrandLogo />
          LaundryBook
        </NavLink>

        {/* Desktop: links + user inline */}
        <div className="d-none d-lg-flex align-items-center gap-4">
          {navItems.map((route) => (
            <NavLink
              key={route.path}
              to={route.path}
              className={({ isActive }) =>
                `text-decoration-none fw-medium ${isActive ? 'text-primary' : 'text-secondary'}`
              }
              style={{ fontSize: '0.9rem' }}
            >
              {route.label}
            </NavLink>
          ))}
          {user && (
            <span style={{ color: '#5a6a7a', fontSize: '0.85rem', maxWidth: 200 }} className="text-truncate">
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

        {/* Mobile: hamburger */}
        <button
          className="btn border-0 d-lg-none p-1"
          type="button"
          aria-expanded={open}
          aria-label={open ? 'Luk menu' : 'Åbn menu'}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </button>
      </div>

      {/* ── Mobile dropdown ── */}
      {open && (
        <div className="border-top d-lg-none" style={{ backgroundColor: '#fff' }}>
          <div className="container-xl px-4 py-2 d-flex flex-column gap-1">
            {navItems.map((route) => (
              <NavLink
                key={route.path}
                to={route.path}
                className={({ isActive }) =>
                  `d-block py-2 px-2 rounded-2 text-decoration-none fw-medium ${isActive ? 'text-primary' : 'text-secondary'}`
                }
                style={{ fontSize: '0.95rem' }}
              >
                {route.label}
              </NavLink>
            ))}
            <div className="border-top my-1" />
            {user && (
              <span className="px-2 py-1 text-truncate" style={{ color: '#5a6a7a', fontSize: '0.82rem' }}>
                {user.email}
              </span>
            )}
            <button
              className="btn btn-outline-secondary btn-sm mb-2"
              style={{ borderRadius: '7px', fontSize: '0.85rem', alignSelf: 'flex-start' }}
              onClick={handleLogout}
            >
              Log ud
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}
