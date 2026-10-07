import { NavLink } from 'react-router-dom'
import { colors } from './theme'

export function SidebarLink({ to, icon, label, end = false }: { to: string; icon?: React.ReactNode; label: string; end?: boolean }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `sidebar-link d-flex align-items-center gap-2 px-3 py-2 rounded-2 text-decoration-none fw-medium mb-1${isActive ? ' sidebar-link--active' : ''}`
      }
      style={{ fontSize: '0.875rem', minHeight: 40 }}
    >
      {icon && <span className="flex-shrink-0" style={{ opacity: 0.8, display: 'flex' }}>{icon}</span>}
      {label}
    </NavLink>
  )
}

export function SidebarSectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-2 mb-1 mt-3 text-uppercase fw-semibold" style={{ fontSize: '0.67rem', letterSpacing: '0.09em', color: colors.chromeMuted }}>
      {children}
    </p>
  )
}
