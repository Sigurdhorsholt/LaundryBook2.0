interface EmptyStateProps {
  title: string
  description?: string
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div
      className="d-flex flex-column align-items-center justify-content-center"
      style={{
        border: '1.5px dashed #d0d9e2',
        borderRadius: 12,
        padding: '48px 24px',
        textAlign: 'center',
      }}
    >
      <p className="mb-1 fw-semibold" style={{ color: '#5a6a7a', fontSize: '0.95rem' }}>
        {title}
      </p>
      {description && (
        <p className="mb-0" style={{ color: '#a0adb8', fontSize: '0.85rem' }}>
          {description}
        </p>
      )}
    </div>
  )
}
