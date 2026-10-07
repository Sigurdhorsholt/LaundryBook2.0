import { useMeQuery } from '../features/auth/authApi'
import { isAdmin } from './roleUtils'
import { IconCalendar, IconShield, IconUser } from './icons'

export interface ResidentNavItem {
  to: string
  labelKey: 'nav.laundry' | 'nav.myPage' | 'nav.admin'
  Icon: typeof IconCalendar
}

// Shared by the desktop header and the phone tab bar so the two never drift apart
export function useResidentNavItems(): ResidentNavItem[] {
  const { data: user } = useMeQuery()
  const items: ResidentNavItem[] = [
    { to: '/laundry', labelKey: 'nav.laundry', Icon: IconCalendar },
    { to: '/my-page', labelKey: 'nav.myPage', Icon: IconUser },
  ]
  if (user && isAdmin(user)) items.push({ to: '/admin', labelKey: 'nav.admin', Icon: IconShield })
  return items
}
