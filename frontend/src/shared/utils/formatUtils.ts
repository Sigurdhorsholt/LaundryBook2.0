import type { CurrentUserDto } from '../../features/auth/authApi'

export function userInitials(user: CurrentUserDto): string {
  return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase() || user.email.charAt(0).toUpperCase()
}
