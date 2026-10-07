import { useTranslation } from 'react-i18next'
import { Callout } from '../../shared/ui'

// In BookSpecificMachine mode a room without machines has nothing residents can book.
export function NoMachinesWarning() {
  const { t } = useTranslation()
  return <Callout>{t('laundry.noMachinesWarning')}</Callout>
}
