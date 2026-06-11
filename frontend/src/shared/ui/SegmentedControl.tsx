import { colors } from '../theme'

interface Segment<T extends string> {
  value: T
  label: string
}

interface SegmentedControlProps<T extends string> {
  segments: Segment<T>[]
  value: T
  onChange: (value: T) => void
  /** 'primary' uses primaryLight bg (default). 'dark' uses textPrimary bg. */
  variant?: 'primary' | 'dark'
}

export function SegmentedControl<T extends string>({ segments, value, onChange, variant = 'primary' }: SegmentedControlProps<T>) {
  return (
    <div className="d-flex gap-2">
      {segments.map((seg) => {
        const isActive = seg.value === value
        const activeBg = variant === 'dark' ? colors.textPrimary : colors.primaryLight
        const activeColor = variant === 'dark' ? '#fff' : colors.primary
        const activeBorder = variant === 'dark' ? colors.textPrimary : colors.primaryBorder
        return (
          <button
            key={seg.value}
            type="button"
            className="btn btn-sm"
            style={{
              flex: 1,
              borderRadius: '8px',
              fontSize: '0.82rem',
              backgroundColor: isActive ? activeBg : 'transparent',
              color: isActive ? activeColor : colors.textSecondary,
              border: isActive ? `1px solid ${activeBorder}` : `1px solid ${colors.borderDefault}`,
              fontWeight: isActive ? 600 : 400,
            }}
            onClick={() => onChange(seg.value)}
          >
            {seg.label}
          </button>
        )
      })}
    </div>
  )
}
