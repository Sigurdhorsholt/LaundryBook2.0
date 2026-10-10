import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import type { MachineFilter } from './types'
import { MACHINE_FILTER_LABEL, TAP_TARGET_PX } from './constants'
import { colors } from '../../shared/theme'

interface Props {
  options: MachineFilter[]
  value: MachineFilter
  onChange: (filter: MachineFilter) => void
}

// Lets a resident who needs a dryer see only the slots where one is free, instead of opening each slot
export function MachineFilterSelector({ options, value, onChange }: Props) {
  const { t } = useTranslation()
  const labelId = useId()
  if (options.length === 0) return null

  return (
    <div className="mb-3">
      <span id={labelId} className="d-block mb-1" style={{ fontSize: '0.78rem', fontWeight: 600, color: colors.textSecondary }}>
        {t('laundry.machineFilter.label')}
      </span>
      {/* One connected control, so it doesn't read as a second row of room buttons */}
      <div
        role="group"
        aria-labelledby={labelId}
        className="d-inline-flex"
        style={{ padding: 3, gap: 2, maxWidth: '100%', borderRadius: 22, border: `1px solid ${colors.borderDefault}`, backgroundColor: colors.bgCard }}
      >
        {(['all', ...options] as const).map(f => {
          const active = value === f
          return (
            <button
              key={f}
              type="button"
              className="btn btn-sm"
              aria-pressed={active}
              onClick={() => onChange(f)}
              style={{
                borderRadius: 18, padding: '0 14px', minHeight: TAP_TARGET_PX - 6, border: 'none', whiteSpace: 'nowrap',
                fontSize: '0.82rem', fontWeight: active ? 600 : 500,
                backgroundColor: active ? colors.primary : 'transparent',
                color: active ? colors.textOnPrimary : colors.textSecondary,
              }}
            >
              {t(MACHINE_FILTER_LABEL[f])}
            </button>
          )
        })}
      </div>
    </div>
  )
}
