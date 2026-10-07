import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMeQuery } from '../features/auth/authApi'
import { BrandLogo } from './BrandLogo'
import { LanguageSelector } from './ui'
import { ProfileMenu } from './ProfileMenu'
import { HeaderNav } from './HeaderNav'
import { IconMenu } from './icons'
import { NAVBAR_HEIGHT_PX } from './constants'
import { colors } from './theme'

export function AdminHeader() {
  const { t } = useTranslation()
  const { data: user } = useMeQuery()

  return (
    <header className="sticky-top flex-shrink-0" style={{ backgroundColor: colors.chrome, color: colors.chromeText, zIndex: 1040 }}>
      <div className="container-fluid px-3 px-lg-4 d-flex align-items-center gap-3" style={{ height: NAVBAR_HEIGHT_PX }}>
        <button
          type="button"
          className="btn d-lg-none p-2"
          style={{ color: colors.chromeText, minWidth: 40, minHeight: 40 }}
          data-bs-toggle="offcanvas"
          data-bs-target="#adminSidebar"
          aria-controls="adminSidebar"
          aria-label={t('nav.openSidebar')}
        >
          <IconMenu size={20} />
        </button>

        <NavLink
          to="/admin"
          className="d-flex align-items-center gap-2 fw-bold text-decoration-none"
          style={{ color: colors.bgCard, fontSize: '1.05rem', letterSpacing: '-0.2px' }}
        >
          <BrandLogo size={20} color={colors.chromeAccent} />
          LaundryBook
          <span
            className="badge"
            style={{ backgroundColor: colors.chromeRaised, color: colors.chromeAccent, fontSize: '0.7rem', fontWeight: 600 }}
          >
            {t('nav.admin')}
          </span>
        </NavLink>

        {/* Below lg the sidebar carries these links, so the header stays uncluttered on a phone */}
        <HeaderNav className="d-none d-lg-flex ms-3" />

        <div className="ms-auto d-flex align-items-center gap-2">
          <LanguageSelector tone="dark" />
          {user && <ProfileMenu user={user} />}
        </div>
      </div>
    </header>
  )
}
