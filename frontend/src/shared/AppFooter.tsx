import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { colors } from './theme'

const FOOTER_LINKS = [
  { to: '/faq',       labelKey: 'public.layout.nav.faq' },
  { to: '/privatliv', labelKey: 'public.layout.nav.privacy' },
  { to: '/vilkaar',   labelKey: 'public.layout.nav.terms' },
]

export function AppFooter() {
  const { t } = useTranslation()

  return (
    <footer
      className="flex-shrink-0 border-top"
      style={{ borderColor: colors.borderDefault, backgroundColor: colors.bgCard }}
    >
      <div className="container-fluid px-3 px-lg-4 py-3 d-flex flex-wrap align-items-center justify-content-center justify-content-sm-between gap-2">
        <span style={{ fontSize: '0.8rem', color: colors.textMuted }}>
          © {new Date().getFullYear()} LaundryBook
        </span>
        <nav className="d-flex align-items-center gap-3">
          {FOOTER_LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-decoration-none"
              style={{ fontSize: '0.8rem', color: colors.textSecondary }}
            >
              {(t as (k: string) => string)(l.labelKey)}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  )
}
