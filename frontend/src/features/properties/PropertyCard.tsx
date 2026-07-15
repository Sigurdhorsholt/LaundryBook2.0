import { useNavigate } from 'react-router-dom'
import type { UserComplexMembershipDto } from '../auth/authApi'
import { ROLE_LABEL } from '../../shared/constants'
import { IconBuilding, IconChevronRight } from '../../shared/icons'
import { colors } from '../../shared/theme'

const QUICK_LINKS = [
  { label: 'Brugere', path: 'users' },
  { label: 'Indstillinger', path: 'settings' },
  { label: 'Vaskerum', path: 'laundry' },
  { label: 'Bookinger', path: 'bookings' },
]

interface PropertyCardProps {
  membership: UserComplexMembershipDto
  variant: 'full' | 'compact'
}

export function PropertyCard({ membership: m, variant }: PropertyCardProps) {
  const navigate = useNavigate()

  if (variant === 'compact') {
    return (
      <div
        className="property-card bg-white rounded-3 p-3 d-flex align-items-center gap-3"
        style={{ border: `1px solid ${colors.borderDefault}` }}
        onClick={() => navigate(`/admin/properties/${m.propertyId}/users`)}
      >
        <div
          className="rounded-2 d-flex align-items-center justify-content-center flex-shrink-0"
          style={{ width: 40, height: 40, backgroundColor: colors.primaryLight }}
        >
          <IconBuilding size={18} color={colors.primary} />
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <p className="fw-semibold mb-0 text-truncate" style={{ fontSize: '0.9rem', color: colors.textPrimary }}>
            {m.propertyName}
          </p>
          <p className="mb-0" style={{ fontSize: '0.78rem', color: colors.textSecondary }}>
            {ROLE_LABEL[m.role]}{m.apartmentNumber ? ` · Lejl. ${m.apartmentNumber}` : ''}
          </p>
        </div>
        <span className="flex-shrink-0"><IconChevronRight size={16} color={colors.textMuted} /></span>
      </div>
    )
  }

  return (
    <div
      className="property-card bg-white rounded-3 p-4 h-100 d-flex flex-column"
      style={{ border: `1px solid ${colors.borderDefault}` }}
      onClick={() => navigate(`/admin/properties/${m.propertyId}/users`)}
    >
      <div className="d-flex align-items-center gap-3 mb-4">
        <div
          className="rounded-2 d-flex align-items-center justify-content-center flex-shrink-0"
          style={{ width: 44, height: 44, backgroundColor: colors.primaryLight }}
        >
          <IconBuilding size={20} color={colors.primary} />
        </div>
        <div style={{ minWidth: 0 }}>
          <p className="fw-bold mb-0 text-truncate" style={{ color: colors.textPrimary }}>
            {m.propertyName}
          </p>
          <span
            className="badge"
            style={{ backgroundColor: colors.primaryLight, color: colors.primary, fontSize: '0.72rem', fontWeight: 500 }}
          >
            {ROLE_LABEL[m.role]}
          </span>
        </div>
      </div>

      <div className="row g-2 mt-auto">
        {QUICK_LINKS.map((link) => (
          <div key={link.path} className="col-6">
            <button
              className="btn w-100 text-start"
              style={{
                fontSize: '0.82rem',
                color: colors.textSecondary,
                backgroundColor: colors.bgPage,
                border: `1px solid ${colors.borderDefault}`,
                borderRadius: '8px',
                padding: '6px 10px',
              }}
              onClick={(e) => {
                e.stopPropagation()
                navigate(`/admin/properties/${m.propertyId}/${link.path}`)
              }}
            >
              {link.label} →
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
