import { UserRole, type CurrentUserDto } from '../features/auth/authApi'

/** Returns the single highest role the user holds across all their memberships. */
export function getHighestRole(user: CurrentUserDto): UserRole {
  if (!user.memberships.length) return UserRole.Resident
  return Math.max(...user.memberships.map((m) => m.role)) as UserRole
}

// SysAdmin may act on every property; anyone else needs the role on the property being viewed,
// not just somewhere (an admin of property A can be a plain resident of property B).
export function hasRoleFor(user: CurrentUserDto, minRole: UserRole, propertyId?: string): boolean {
  const highest = getHighestRole(user)
  if (highest === UserRole.SysAdmin || propertyId === undefined) return highest >= minRole
  const membership = user.memberships.find((m) => m.propertyId === propertyId)
  return membership !== undefined && membership.role >= minRole
}

export function isAdmin(user: CurrentUserDto): boolean {
  return getHighestRole(user) >= UserRole.ComplexAdmin
}
