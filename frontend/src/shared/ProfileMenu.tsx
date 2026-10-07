import { useTranslation } from 'react-i18next'
import type { CurrentUserDto } from '../features/auth/authApi'
import { useLogout } from '../features/auth/useLogout'
import { IconLogOut } from './icons'
import { colors } from './theme'

export function ProfileMenu({ user }: { user: CurrentUserDto }) {
  const { t } = useTranslation()
  const handleLogout = useLogout()
  const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase() || user.email.charAt(0).toUpperCase()

  return (
    <div className="dropdown">
      <button
        type="button"
        data-bs-toggle="dropdown"
        aria-expanded="false"
        aria-label={t('nav.profileMenu')}
        style={{
          width: 40, height: 40, borderRadius: '50%', border: 'none', cursor: 'pointer',
          backgroundColor: colors.chromeAccent, color: colors.chrome, fontWeight: 700, fontSize: '0.8rem',
        }}
      >
        {initials}
      </button>
      <ul className="dropdown-menu dropdown-menu-end" style={{ minWidth: 220 }}>
        <li className="px-3 py-2">
          <div style={{ fontWeight: 600, fontSize: '0.9rem', color: colors.textPrimary }}>{user.firstName} {user.lastName}</div>
          <div style={{ fontSize: '0.8rem', color: colors.textMuted, overflowWrap: 'anywhere' }}>{user.email}</div>
        </li>
        <li><hr className="dropdown-divider" /></li>
        <li>
          <button type="button" className="dropdown-item d-flex align-items-center gap-2" style={{ minHeight: 40 }} onClick={handleLogout}>
            <IconLogOut size={16} />
            {t('nav.logout')}
          </button>
        </li>
      </ul>
    </div>
  )
}
