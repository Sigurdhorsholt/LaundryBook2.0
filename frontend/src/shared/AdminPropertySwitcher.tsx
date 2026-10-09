import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMeQuery, UserRole } from '../features/auth/authApi'
import { IconCheck, IconChevronDown } from './icons'
import { colors } from './theme'

interface Props {
  propertyId: string
}

const label: React.CSSProperties = { fontSize: '0.65rem', letterSpacing: '0.09em', color: colors.chromeMuted }
const name: React.CSSProperties = { fontSize: '0.92rem', color: colors.bgCard }

// The property box at the top of the admin sidebar. With more than one property it switches to the
// same page (Bookinger, Brugere, …) of another one.
export function AdminPropertySwitcher({ propertyId }: Props) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { data: user } = useMeQuery()
  // The same properties the admin's property list shows
  const adminOf = user?.memberships.filter(m => m.role >= UserRole.ComplexAdmin) ?? []
  const current = user?.memberships.find(m => m.propertyId === propertyId)
  const currentName = current?.propertyName ?? t('nav.property')

  if (adminOf.length < 2) {
    return (
      <div className="px-3 py-2 mb-1 rounded-2" style={{ backgroundColor: colors.chromeRaised }}>
        <p className="mb-0 text-uppercase fw-semibold" style={label}>{t('nav.property')}</p>
        <p className="mb-0 text-truncate fw-semibold" style={name}>{currentName}</p>
      </div>
    )
  }

  const subPath = pathname.slice(`/admin/properties/${propertyId}`.length)

  return (
    <div className="dropdown mb-1">
      <button
        type="button"
        data-bs-toggle="dropdown"
        aria-expanded="false"
        aria-label={t('propertySwitcher.label', { property: currentName })}
        className="d-flex align-items-center justify-content-between gap-2 w-100 px-3 py-2 rounded-2 border-0 text-start"
        style={{ backgroundColor: colors.chromeRaised, cursor: 'pointer' }}
      >
        <span style={{ minWidth: 0 }}>
          <span className="d-block text-uppercase fw-semibold" style={label}>{t('nav.property')}</span>
          <span className="d-block text-truncate fw-semibold" style={name}>{currentName}</span>
        </span>
        <span style={{ color: colors.chromeMuted, flexShrink: 0 }}><IconChevronDown size={16} /></span>
      </button>
      <ul className="dropdown-menu w-100">
        {adminOf.map(m => {
          const isCurrent = m.propertyId === propertyId
          return (
            <li key={m.propertyId}>
              <button
                type="button"
                className="dropdown-item d-flex align-items-center justify-content-between gap-2"
                style={{ minHeight: 40 }}
                aria-current={isCurrent ? 'true' : undefined}
                onClick={() => navigate(`/admin/properties/${m.propertyId}${subPath}`)}
              >
                <span className="text-truncate">{m.propertyName}</span>
                {isCurrent && <IconCheck size={16} color={colors.primary} strokeWidth={2.5} />}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
