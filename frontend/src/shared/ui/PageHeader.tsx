import type { ReactNode } from 'react'

interface PageHeaderProps {
  /** Small grey label above the title — typically the property name */
  eyebrow?: string
  title: string
  description?: string
  /** Optional button / element rendered top-right */
  action?: ReactNode
}

export function PageHeader({ eyebrow, title, description, action }: PageHeaderProps) {
  return (
    <div className="mb-5">
      {eyebrow && (
        <p className="mb-1" style={{ fontSize: '0.8rem', color: '#a0adb8', fontWeight: 500 }}>
          {eyebrow}
        </p>
      )}
      <div className="d-flex align-items-start justify-content-between gap-3">
        <div>
          <h1 className="fw-bold mb-0" style={{ fontSize: '1.6rem', color: '#0d1b2a' }}>
            {title}
          </h1>
          {description && (
            <p className="mt-1 mb-0" style={{ fontSize: '0.85rem', color: '#5a6a7a' }}>
              {description}
            </p>
          )}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    </div>
  )
}
