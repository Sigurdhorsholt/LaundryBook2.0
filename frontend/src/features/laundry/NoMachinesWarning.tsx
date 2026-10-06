import { useTranslation } from 'react-i18next'
import { colors } from '../../shared/theme'

// In BookSpecificMachine mode a room without machines has nothing residents can book.
export function NoMachinesWarning() {
  const { t } = useTranslation()
  return (
    <div
      role="status"
      style={{
        fontSize: '0.8rem',
        color: colors.warningText,
        backgroundColor: colors.warningBg,
        border: `1px solid ${colors.warningBorder}`,
        borderRadius: 8,
        padding: '6px 10px',
      }}
    >
      {t('laundry.noMachinesWarning')}
    </div>
  )
}
