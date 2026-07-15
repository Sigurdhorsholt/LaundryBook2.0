import { NavLink, Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { colors } from '../../shared/theme'
import { BrandLogo } from '../../shared/BrandLogo'
import { useOffcanvasAutoClose } from '../../shared/utils/bootstrapUtils'
import { IconMenu, IconBrand } from '../../shared/icons'
import { useModal } from '../../shared/modals/useModal'

const NAV_LINKS = [
  { to: '/features', labelKey: 'public.layout.nav.features' },
  { to: '/demo',     labelKey: 'public.layout.nav.demo' },
  { to: '/faq',      labelKey: 'public.layout.nav.faq' },
  { to: '/om',       labelKey: 'public.layout.nav.about' },
]

const CONTACT_EMAIL = 'sigurd-horsholt@hotmail.com'

const OFFCANVAS_ID = 'publicNavOffcanvas'

function PublicNavbar() {
  const { openModal } = useModal()
  const { t } = useTranslation()
  useOffcanvasAutoClose(OFFCANVAS_ID)

  return (
    <>
      <nav
        className="sticky-top border-bottom"
        style={{ backgroundColor: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(10px)', zIndex: 1040 }}
      >
        <div className="container-xl px-3 px-lg-4 d-flex align-items-center" style={{ height: 64 }}>

          <Link
            to="/"
            className="d-flex align-items-center gap-2 fw-bold text-decoration-none"
            style={{ color: colors.textPrimary, fontSize: '1.05rem', letterSpacing: '-0.2px' }}
          >
            <BrandLogo size={20} />
            LaundryBook
          </Link>

          <div className="d-none d-lg-flex align-items-center gap-1 ms-4">
            {NAV_LINKS.map(l => (
              <NavLink
                key={l.to}
                to={l.to}
                className="btn btn-sm"
                style={({ isActive }) => ({
                  borderRadius: 7,
                  fontSize: '0.88rem',
                  color: isActive ? colors.primary : colors.textSecondary,
                  backgroundColor: isActive ? colors.primaryLight : undefined,
                  fontWeight: isActive ? 600 : 500,
                })}
              >
                {(t as (k: string) => string)(l.labelKey)}
              </NavLink>
            ))}
          </div>

          <div className="ms-auto d-flex align-items-center gap-2">
            <button
              className="btn btn-sm d-none d-sm-inline-block"
              style={{ color: colors.textSecondary, borderRadius: 7, fontSize: '0.88rem' }}
              onClick={() => openModal('login')}
            >
              {t('public.layout.login')}
            </button>
            <Link
              to="/get-started"
              className="btn btn-sm fw-semibold text-decoration-none"
              style={{
                backgroundColor: colors.primary,
                color: '#fff',
                borderRadius: 8,
                fontSize: '0.88rem',
                padding: '7px 16px',
                border: 'none',
              }}
            >
              {t('public.layout.getStarted')}
            </Link>
            <button
              className="btn d-lg-none p-2 ms-1"
              style={{ color: colors.textSecondary }}
              type="button"
              data-bs-toggle="offcanvas"
              data-bs-target={`#${OFFCANVAS_ID}`}
              aria-controls={OFFCANVAS_ID}
              aria-label={t('nav.openNavigation')}
            >
              <IconMenu size={22} />
            </button>
          </div>

        </div>
      </nav>

      <div
        className="offcanvas offcanvas-end"
        id={OFFCANVAS_ID}
        tabIndex={-1}
        aria-labelledby="publicNavLabel"
        style={{ width: 'min(320px, 85vw)' }}
      >
        <div className="offcanvas-header border-bottom px-4 py-3">
          <div className="d-flex align-items-center gap-2">
            <BrandLogo size={18} />
            <span id="publicNavLabel" className="fw-bold" style={{ color: colors.textPrimary, fontSize: '1.05rem' }}>
              LaundryBook
            </span>
          </div>
          <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label={t('common.close')} />
        </div>
        <div className="offcanvas-body px-4 py-3 d-flex flex-column">
          {NAV_LINKS.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              className="text-decoration-none py-3 border-bottom fw-medium"
              style={({ isActive }) => ({
                fontSize: '1.1rem',
                color: isActive ? colors.primary : colors.textPrimary,
                fontWeight: isActive ? 700 : undefined,
              })}
            >
              {(t as (k: string) => string)(l.labelKey)}
            </NavLink>
          ))}
          <div className="d-flex gap-2 mt-4">
            <Link
              to="/get-started"
              className="btn fw-semibold text-decoration-none"
              style={{
                backgroundColor: colors.primary,
                color: '#fff',
                borderRadius: 8,
                fontSize: '0.95rem',
                minWidth: 140,
                border: 'none',
              }}
            >
              {t('public.layout.getStarted')}
            </Link>
            <button
              className="btn fw-medium"
              style={{ color: colors.textSecondary, borderRadius: 8, fontSize: '0.95rem', border: `1px solid ${colors.borderStrong}` }}
              onClick={() => openModal('login')}
            >
              {t('public.layout.login')}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

function PublicFooter() {
  const { t } = useTranslation()
  const groups: { title: string; items: [string, string | null][] }[] = [
    { title: t('public.layout.footer.product'), items: [[t('public.layout.nav.features'), '/features'], [t('public.layout.nav.demo'), '/demo']] },
    { title: t('public.layout.footer.company'), items: [[t('public.layout.nav.about'), '/om'], [t('public.layout.nav.faq'), '/faq']] },
    { title: t('public.layout.footer.legal'), items: [[t('public.layout.nav.privacy'), '/privatliv'], [t('public.layout.nav.terms'), '/vilkaar']] },
    { title: t('public.layout.footer.contact'), items: [[CONTACT_EMAIL, null]] },
  ]

  return (
    <footer style={{ backgroundColor: colors.footerBg, color: 'rgba(255,255,255,0.72)' }}>
      <div className="container-xl px-4 py-5">
        <div className="row g-4">
          <div className="col-12 col-lg-4">
            <div className="d-flex align-items-center gap-2 mb-3">
              <IconBrand size={22} color="#4fc3f7" />
              <span className="fw-bold" style={{ color: '#fff', fontSize: '1.1rem' }}>LaundryBook</span>
            </div>
            <p className="mb-0" style={{ fontSize: '0.9rem', maxWidth: 320, lineHeight: 1.65 }}>
              {t('public.layout.footer.tagline')}
            </p>
          </div>
          {groups.map(g => (
            <div key={g.title} className="col-6 col-lg-2">
              <h6 className="fw-semibold mb-3" style={{ color: '#fff', fontSize: '0.85rem', letterSpacing: '0.02em' }}>
                {g.title}
              </h6>
              <ul className="list-unstyled mb-0">
                {g.items.map(([label, to]) => (
                  <li key={label} className="mb-2">
                    {to ? (
                      <Link to={to} className="text-decoration-none" style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.88rem' }}>
                        {label}
                      </Link>
                    ) : label.includes('@') ? (
                      <a href={`mailto:${label}`} className="text-decoration-none" style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.88rem' }}>
                        {label}
                      </a>
                    ) : (
                      <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.88rem' }}>{label}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div
          className="mt-5 pt-4 d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2"
          style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}
        >
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem' }}>
            © {new Date().getFullYear()} LaundryBook
          </span>
        </div>
      </div>
    </footer>
  )
}

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="d-flex flex-column min-vh-100">
      <PublicNavbar />
      <main className="flex-grow-1">{children}</main>
      <PublicFooter />
    </div>
  )
}
