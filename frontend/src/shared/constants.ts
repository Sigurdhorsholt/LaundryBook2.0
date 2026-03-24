import { UserRole } from '../features/auth/authApi'

export const ROLE_LABEL: Record<UserRole, string> = {
  [UserRole.Resident]: 'Beboer',
  [UserRole.ComplexAdmin]: 'Ejendomsadmin',
  [UserRole.OrgAdmin]: 'Organisationsadmin',
  [UserRole.SysAdmin]: 'Systemadmin',
}

export const ROLE_BADGE_STYLE: Record<UserRole, { bg: string; color: string }> = {
  [UserRole.Resident]:     { bg: '#f0f4f8', color: '#5a6a7a' },
  [UserRole.ComplexAdmin]: { bg: '#e8f0fe', color: '#1565c0' },
  [UserRole.OrgAdmin]:     { bg: '#e8f5e9', color: '#2e7d32' },
  [UserRole.SysAdmin]:     { bg: '#fce4ec', color: '#c62828' },
}

export const ROLE_OPTIONS = [
  { value: UserRole.Resident, label: 'Beboer' },
  { value: UserRole.ComplexAdmin, label: 'Ejendomsadmin' },
]
