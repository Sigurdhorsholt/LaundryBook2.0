import i18n from '../../i18n'
import type { CurrentUserDto } from '../../features/auth/authApi'

export function userInitials(user: CurrentUserDto): string {
  return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase() || user.email.charAt(0).toUpperCase()
}

export function durationLabel(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return i18n.t('laundry.duration.minutes', { m })
  return m === 0 ? i18n.t('laundry.duration.hours', { h }) : i18n.t('laundry.duration.hoursMinutes', { h, m })
}
