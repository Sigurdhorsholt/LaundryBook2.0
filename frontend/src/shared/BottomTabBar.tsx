import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useResidentNavItems } from './residentNav'
import { BOTTOM_TAB_HEIGHT_PX } from './constants'
import { colors } from './theme'

export function BottomTabBar() {
  const { t } = useTranslation()
  const navItems = useResidentNavItems()

  return (
    // d-md-none is !important, so it still hides the bar on wider screens despite the inline display
    <nav
      aria-label={t('nav.mainMenu')}
      className="d-md-none"
      style={{
        position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 1030, display: 'flex',
        backgroundColor: colors.bgCard, borderTop: `1px solid ${colors.borderDefault}`,
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {navItems.map(({ to, labelKey, Icon }) => (
        <NavLink
          key={to}
          to={to}
          className="text-decoration-none"
          style={({ isActive }) => ({
            flex: 1, minHeight: BOTTOM_TAB_HEIGHT_PX, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 2, fontSize: '0.72rem',
            fontWeight: isActive ? 700 : 500, color: isActive ? colors.primaryMutedText : colors.textSecondary,
          })}
        >
          {({ isActive }) => (
            <>
              <span style={{
                width: 56, height: 30, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: isActive ? colors.primaryLight : 'transparent',
              }}>
                <Icon size={20} />
              </span>
              {t(labelKey)}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
