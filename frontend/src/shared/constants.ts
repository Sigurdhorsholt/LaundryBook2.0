import { UserRole } from '../features/auth/authApi'
import { colors } from './theme'

export const ROLE_LABEL: Record<UserRole, string> = {
  [UserRole.Resident]: 'Beboer',
  [UserRole.ComplexAdmin]: 'Ejendomsadmin',
  [UserRole.OrgAdmin]: 'Organisationsadmin',
  [UserRole.SysAdmin]: 'Systemadmin',
}

export const ROLE_BADGE_STYLE: Record<UserRole, { bg: string; color: string }> = {
  [UserRole.Resident]:     { bg: colors.roleResident.bg,     color: colors.roleResident.text     },
  [UserRole.ComplexAdmin]: { bg: colors.roleComplexAdmin.bg, color: colors.roleComplexAdmin.text },
  [UserRole.OrgAdmin]:     { bg: colors.roleOrgAdmin.bg,     color: colors.roleOrgAdmin.text     },
  [UserRole.SysAdmin]:     { bg: colors.roleSysAdmin.bg,     color: colors.roleSysAdmin.text     },
}

export const ROLE_OPTIONS = [
  { value: UserRole.Resident, label: 'Beboer' },
  { value: UserRole.ComplexAdmin, label: 'Ejendomsadmin' },
]
