import { useTranslation } from 'react-i18next'
import { UserRole } from '../features/auth/authApi'
import { colors } from './theme'

// laundrybook.dk redirects here, so canonical URLs must use this host
export const SITE_ORIGIN = 'https://www.laundrybook.dk'

// Bootstrap's lg/xl breakpoints; inline styles can't hold media queries, so layout switches read these
export const MEDIA_LG = '(min-width: 992px)'
export const MEDIA_XL = '(min-width: 1200px)'

// The app navbar is sticky; anything else that sticks to the top must sit below it
export const NAVBAR_HEIGHT_PX = 56

export const ROLE_LABEL_KEY = {
  [UserRole.Resident]: 'roles.resident',
  [UserRole.ComplexAdmin]: 'roles.complexAdmin',
  [UserRole.OrgAdmin]: 'roles.orgAdmin',
  [UserRole.SysAdmin]: 'roles.sysAdmin',
} as const satisfies Record<UserRole, string>

export const ROLE_BADGE_STYLE: Record<UserRole, { bg: string; color: string }> = {
  [UserRole.Resident]:     { bg: colors.roleResident.bg,     color: colors.roleResident.text     },
  [UserRole.ComplexAdmin]: { bg: colors.roleComplexAdmin.bg, color: colors.roleComplexAdmin.text },
  [UserRole.OrgAdmin]:     { bg: colors.roleOrgAdmin.bg,     color: colors.roleOrgAdmin.text     },
  [UserRole.SysAdmin]:     { bg: colors.roleSysAdmin.bg,     color: colors.roleSysAdmin.text     },
}

export function useRoleLabel() {
  const { t } = useTranslation()
  return (role: UserRole) => t(ROLE_LABEL_KEY[role])
}

export function useRoleOptions() {
  const label = useRoleLabel()
  return [
    { value: UserRole.Resident, label: label(UserRole.Resident) },
    { value: UserRole.ComplexAdmin, label: label(UserRole.ComplexAdmin) },
  ]
}

export function useAdminRoleOptions() {
  const label = useRoleLabel()
  return [
    { value: UserRole.ComplexAdmin, label: label(UserRole.ComplexAdmin) },
    { value: UserRole.OrgAdmin, label: label(UserRole.OrgAdmin) },
  ]
}

export function useAllMemberRoleOptions() {
  const label = useRoleLabel()
  return [
    { value: UserRole.Resident, label: label(UserRole.Resident) },
    { value: UserRole.ComplexAdmin, label: label(UserRole.ComplexAdmin) },
    { value: UserRole.OrgAdmin, label: label(UserRole.OrgAdmin) },
  ]
}
