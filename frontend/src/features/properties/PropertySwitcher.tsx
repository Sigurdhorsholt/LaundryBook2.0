import { useTranslation } from 'react-i18next'
import { useActiveProperty } from './useActiveProperty'
import { IconCheck, IconChevronDown } from '../../shared/icons'
import { colors } from '../../shared/theme'

const pill: React.CSSProperties = {
  padding: '4px 12px', borderRadius: 999, backgroundColor: colors.chromeRaised, color: colors.chromeText,
  fontSize: '0.8rem', fontWeight: 500,
}

// The property name in the header. For someone in more than one property it opens a menu to switch.
export function PropertySwitcher() {
  const { t } = useTranslation()
  const { membership, memberships, select } = useActiveProperty()
  if (!membership) return null

  if (memberships.length < 2) {
    return <span className="d-none d-md-inline" style={pill}>{membership.propertyName}</span>
  }

  return (
    <div className="dropdown" style={{ minWidth: 0 }}>
      <button
        type="button"
        data-bs-toggle="dropdown"
        aria-expanded="false"
        aria-label={t('propertySwitcher.label', { property: membership.propertyName })}
        className="d-inline-flex align-items-center gap-1"
        style={{ ...pill, border: 'none', cursor: 'pointer', minHeight: 36, maxWidth: 'min(52vw, 280px)' }}
      >
        <span className="text-truncate">{membership.propertyName}</span>
        <IconChevronDown size={14} />
      </button>
      <ul className="dropdown-menu" style={{ minWidth: 240 }}>
        <li className="px-3 pt-1 pb-2" style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: colors.textMuted }}>
          {t('propertySwitcher.title')}
        </li>
        {memberships.map(m => {
          const current = m.propertyId === membership.propertyId
          return (
            <li key={m.propertyId}>
              <button
                type="button"
                className="dropdown-item d-flex align-items-center justify-content-between gap-2"
                style={{ minHeight: 40 }}
                aria-current={current ? 'true' : undefined}
                onClick={() => select(m.propertyId)}
              >
                <span className="text-truncate">{m.propertyName}</span>
                {current && <IconCheck size={16} color={colors.primary} strokeWidth={2.5} />}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
