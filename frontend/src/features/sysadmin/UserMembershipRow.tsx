import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { UserPropertyMembershipDto } from './sysAdminApi'
import { useAllMemberRoleOptions } from '../../shared/constants'
import type { UserRole } from '../auth/authApi'
import { colors } from '../../shared/theme'

interface Props {
  membership: UserPropertyMembershipDto
  onChange: (role: UserRole, isActive: boolean) => void
  onRemove: () => void
}

export function UserMembershipRow({ membership: m, onChange, onRemove }: Props) {
  const { t } = useTranslation()
  const roleOptions = useAllMemberRoleOptions()
  const [confirmingRemove, setConfirmingRemove] = useState(false)

  return (
    <div
      className="d-flex flex-wrap align-items-center gap-2 mb-2 p-2 rounded-2"
      style={{ border: `1px solid ${colors.borderDefault}`, backgroundColor: colors.bgSubtle }}
    >
      <span style={{ flex: '1 1 160px', minWidth: 0, fontSize: '0.875rem', color: colors.textPrimary }}>
        <span className="fw-medium">{m.propertyName}</span>
        {m.apartmentNumber && <span style={{ color: colors.textMuted }}> · {t('laundry.apartmentShort', { number: m.apartmentNumber })}</span>}
      </span>

      <select
        className="form-select form-select-sm"
        style={{ width: 'auto' }}
        value={m.role}
        aria-label={t('sysadmin.userDetail.roleIn', { property: m.propertyName })}
        onChange={(e) => onChange(Number(e.target.value) as UserRole, m.isActive)}
      >
        {roleOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>

      <button
        type="button"
        className="btn btn-sm"
        style={{
          fontSize: '0.78rem',
          backgroundColor: m.isActive ? colors.successBg : colors.bgMuted,
          color: m.isActive ? colors.successText : colors.textMuted,
          border: `1px solid ${m.isActive ? colors.successBorder : colors.borderDefault}`,
        }}
        onClick={() => onChange(m.role, !m.isActive)}
      >
        {m.isActive ? t('sysadmin.active') : t('sysadmin.inactive')}
      </button>

      {confirmingRemove ? (
        <>
          <button type="button" className="btn btn-sm btn-danger" onClick={() => { setConfirmingRemove(false); onRemove() }}>
            {t('sysadmin.confirmRemove')}
          </button>
          <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setConfirmingRemove(false)}>
            {t('common.cancel')}
          </button>
        </>
      ) : (
        <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => setConfirmingRemove(true)}>
          {t('sysadmin.remove')}
        </button>
      )}
    </div>
  )
}
