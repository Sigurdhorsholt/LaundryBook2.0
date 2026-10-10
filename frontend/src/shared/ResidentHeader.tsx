import { NavLink } from 'react-router-dom'
import { useMeQuery } from '../features/auth/authApi'
import { useActiveProperty } from '../features/properties/useActiveProperty'
import { PropertySwitcher } from '../features/properties/PropertySwitcher'
import { BrandLogo } from './BrandLogo'
import { LanguageSelector } from './ui'
import { ProfileMenu } from './ProfileMenu'
import { HeaderNav } from './HeaderNav'
import { NAVBAR_HEIGHT_PX } from './constants'
import { colors } from './theme'

export function ResidentHeader() {
  const { data: user } = useMeQuery()
  const { membership, memberships } = useActiveProperty()
  const propertyName = membership?.propertyName
  // With several properties the switcher next to the logo names the building instead
  const switchable = memberships.length > 1

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
          {!switchable && <span className="d-md-none text-truncate">{propertyName ?? 'LaundryBook'}</span>}
        </NavLink>

        <PropertySwitcher />

        <HeaderNav className="d-none d-md-flex" />

        <div className="ms-auto d-flex align-items-center gap-2">
          <LanguageSelector tone="dark" />
          {user && <ProfileMenu user={user} />}
        </div>
      </div>
    </header>
  )
}
