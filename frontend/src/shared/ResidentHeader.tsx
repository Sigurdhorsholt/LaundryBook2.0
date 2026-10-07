import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMeQuery } from '../features/auth/authApi'
import { BrandLogo } from './BrandLogo'
import { LanguageSelector } from './ui'
import { ProfileMenu } from './ProfileMenu'
import { useResidentNavItems } from './residentNav'
import { NAVBAR_HEIGHT_PX } from './constants'
import { colors } from './theme'

export function ResidentHeader() {
  const { t } = useTranslation()
  const { data: user } = useMeQuery()
  const navItems = useResidentNavItems()
  const propertyName = user?.memberships[0]?.propertyName

  return (
    <header className="sticky-top flex-shrink-0" style={{ backgroundColor: colors.chrome, color: colors.chromeText, zIndex: 1040 }}>
      <div className="container-fluid px-3 px-lg-4 d-flex align-items-center gap-3" style={{ height: NAVBAR_HEIGHT_PX }}>
        <NavLink
          to="/laundry"
          className="d-flex align-items-center gap-2 fw-bold text-decoration-none"
          style={{ color: colors.bgCard, fontSize: '1.05rem', letterSpacing: '-0.2px', minWidth: 0 }}
        >
          <BrandLogo size={20} color={colors.chromeAccent} />
          <span className="d-none d-md-inline">LaundryBook</span>
          {/* On a phone the tab bar carries the navigation, so the header names the building instead */}
          <span className="d-md-none text-truncate">{propertyName ?? 'LaundryBook'}</span>
        </NavLink>

        {propertyName && (
          <span
            className="d-none d-md-inline"
            style={{ padding: '4px 12px', borderRadius: 999, backgroundColor: colors.chromeRaised, color: colors.chromeText, fontSize: '0.8rem', fontWeight: 500 }}
          >
            {propertyName}
          </span>
        )}

        <nav aria-label={t('nav.mainMenu')} className="d-none d-md-flex align-items-center gap-1">
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

        <div className="ms-auto d-flex align-items-center gap-2">
          <LanguageSelector tone="dark" />
          {user && <ProfileMenu user={user} />}
        </div>
      </div>
    </header>
  )
}
