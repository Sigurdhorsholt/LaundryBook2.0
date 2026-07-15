import { useTranslation } from 'react-i18next'
import { colors } from '../../shared/theme'
import { IconShield } from '../../shared/icons'
import { PropertiesList } from '../../features/properties/PropertiesList'
import { PendingPropertiesList } from '../../features/sysadmin/PendingPropertiesList'
import { UserTable } from '../../features/sysadmin/UserTable'
import { AuditLogTable } from '../../features/sysadmin/AuditLogTable'
import { TestEmailPanel } from '../../features/sysadmin/TestEmailPanel'

export function SysAdminPage() {
  const { t } = useTranslation()
  return (
    <div className="p-4 p-lg-5">
      <div className="mb-4 d-flex align-items-center gap-3">
        <div
          className="rounded-2 d-flex align-items-center justify-content-center flex-shrink-0"
          style={{ width: 40, height: 40, backgroundColor: colors.roleSysAdmin.bg }}
        >
          <IconShield size={20} color={colors.roleSysAdmin.text} />
        </div>
        <div>
          <h1 className="fw-bold mb-0" style={{ fontSize: '1.5rem', color: colors.textPrimary }}>{t('nav.system')}</h1>
          <p className="mb-0" style={{ color: colors.textSecondary, fontSize: '0.875rem' }}>
            {t('sysadminPage.subtitle')}
          </p>
        </div>
      </div>

      <div
        className="rounded-3 p-4 mb-4"
        style={{ border: `1px solid ${colors.borderDefault}`, backgroundColor: colors.bgCard }}
      >
        <PendingPropertiesList />
      </div>

      <div
        className="rounded-3 p-4 mb-4"
        style={{ border: `1px solid ${colors.borderDefault}`, backgroundColor: colors.bgCard }}
      >
        <PropertiesList />
      </div>

      <div
        className="rounded-3 p-4 mb-4"
        style={{ border: `1px solid ${colors.borderDefault}`, backgroundColor: colors.bgCard }}
      >
        <UserTable />
      </div>

      <div
        className="rounded-3 p-4 mb-4"
        style={{ border: `1px solid ${colors.borderDefault}`, backgroundColor: colors.bgCard }}
      >
        <TestEmailPanel />
      </div>

      <div
        className="rounded-3 p-4"
        style={{ border: `1px solid ${colors.borderDefault}`, backgroundColor: colors.bgCard }}
      >
        <AuditLogTable />
      </div>
    </div>
  )
}
