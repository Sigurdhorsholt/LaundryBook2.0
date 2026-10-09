import { useMeQuery, UserRole } from '../features/auth/authApi'
import { getHighestRole, isAdmin } from './roleUtils'
import { IconBuilding, IconCalendar, IconSettings, IconShield, IconUser } from './icons'

export interface ResidentNavItem {
  to: string
  labelKey: 'nav.laundry' | 'nav.propertyInfo' | 'nav.myPage' | 'nav.admin' | 'nav.system'
  Icon: typeof IconCalendar
}

// Shared by the desktop header and the phone tab bar so the two never drift apart
export function useResidentNavItems(): ResidentNavItem[] {
  const { data: user } = useMeQuery()
  const items: ResidentNavItem[] = [
    { to: '/laundry', labelKey: 'nav.laundry', Icon: IconCalendar },
    { to: '/property', labelKey: 'nav.propertyInfo', Icon: IconBuilding },
    { to: '/my-page', labelKey: 'nav.myPage', Icon: IconUser },
  ]
  if (user && isAdmin(user)) items.push({ to: '/admin', labelKey: 'nav.admin', Icon: IconShield })
  if (user && getHighestRole(user) === UserRole.SysAdmin) items.push({ to: '/admin/system', labelKey: 'nav.system', Icon: IconSettings })
  return items
}
