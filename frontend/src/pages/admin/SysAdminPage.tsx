import { colors } from '../../shared/theme'
import { IconShield } from '../../shared/icons'

export function SysAdminPage() {
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
          <h1 className="fw-bold mb-0" style={{ fontSize: '1.5rem', color: colors.textPrimary }}>System</h1>
          <p className="mb-0" style={{ color: colors.textSecondary, fontSize: '0.875rem' }}>
            Kun synlig for systemadministratorer
          </p>
        </div>
      </div>
      <div
        className="rounded-3 p-4"
        style={{ border: `1px solid ${colors.borderDefault}`, backgroundColor: colors.bgCard }}
      >
        <p style={{ color: colors.textSecondary, marginBottom: 0 }}>
          Systemadmin-funktioner implementeres her.
        </p>
      </div>
    </div>
  )
}
