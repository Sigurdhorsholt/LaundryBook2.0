import { UserRole, type CurrentUserDto } from '../features/auth/authApi'

/** Returns the single highest role the user holds across all their memberships. */
export function getHighestRole(user: CurrentUserDto): UserRole {
  if (!user.memberships.length) return UserRole.Resident
  return Math.max(...user.memberships.map((m) => m.role)) as UserRole
}

export function isAdmin(user: CurrentUserDto): boolean {
  return getHighestRole(user) >= UserRole.ComplexAdmin
}
