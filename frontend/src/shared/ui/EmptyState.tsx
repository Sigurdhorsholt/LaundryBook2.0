import { colors } from '../theme'

interface EmptyStateProps {
  title: string
  description?: string
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div
      className="d-flex flex-column align-items-center justify-content-center"
      style={{
        border: `1.5px dashed ${colors.borderStrong}`,
        borderRadius: 12,
        padding: '48px 24px',
        textAlign: 'center',
      }}
    >
      <p className="mb-1 fw-semibold" style={{ color: colors.textSecondary, fontSize: '0.95rem' }}>
        {title}
      </p>
      {description && (
        <p className="mb-0" style={{ color: colors.textMuted, fontSize: '0.85rem' }}>
          {description}
        </p>
      )}
    </div>
  )
}
