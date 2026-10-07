import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useResidentNavItems } from './residentNav'
import { colors } from './theme'

// Links on the dark header; `className` carries the breakpoint at which the shell shows them
export function HeaderNav({ className }: { className: string }) {
  const { t } = useTranslation()
  const navItems = useResidentNavItems()

  return (
    <nav aria-label={t('nav.mainMenu')} className={`${className} align-items-center gap-1`}>
      {navItems.map(({ to, labelKey }) => (
        <NavLink
          key={to}
          to={to}
          className="chrome-link text-decoration-none"
          style={({ isActive }) => ({
            padding: '8px 14px', borderRadius: 8, fontSize: '0.88rem',
            fontWeight: isActive ? 600 : 500,
            color: isActive ? colors.bgCard : colors.chromeText,
            backgroundColor: isActive ? colors.chromeRaised : undefined,
          })}
        >
          {t(labelKey)}
        </NavLink>
      ))}
    </nav>
  )
}
