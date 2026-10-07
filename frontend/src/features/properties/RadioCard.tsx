import { colors } from '../../shared/theme'

export function RadioCard({
  name,
  selected,
  label,
  description,
  disabled = false,
  onChange,
}: {
  // Shared by the options of one group so arrow keys move between them
  name: string
  selected: boolean
  label: string
  description: string
  disabled?: boolean
  onChange: () => void
}) {
  const borderColor = selected ? colors.primary : colors.borderDefault
  const bg = selected ? colors.primaryLighter : colors.bgCard

  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        padding: '12px 16px',
        borderRadius: 10,
        border: `1.5px solid ${borderColor}`,
        backgroundColor: bg,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled && !selected ? 0.6 : 1,
        transition: 'border-color 0.15s, background-color 0.15s',
      }}
    >
      <input
        type="radio"
        name={name}
        checked={selected}
        disabled={disabled}
        onChange={onChange}
        style={{ marginTop: 3, accentColor: colors.primary, flexShrink: 0 }}
      />
      <div>
        <div className="fw-semibold" style={{ fontSize: '0.88rem', color: colors.textPrimary }}>{label}</div>
        <div style={{ fontSize: '0.82rem', color: colors.textSecondary, marginTop: 2 }}>{description}</div>
      </div>
    </label>
  )
}
