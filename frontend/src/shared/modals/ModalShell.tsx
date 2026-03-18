import { type ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface ModalShellProps {
  title: string
  onClose: () => void
  children: ReactNode
  size?: 'sm' | 'md' | 'lg'
}

export function ModalShell({ title, onClose, children, size = 'md' }: ModalShellProps) {
  const sizeClass = size === 'sm' ? 'modal-sm' : size === 'lg' ? 'modal-lg' : ''

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="modal-backdrop fade show"
        onClick={onClose}
        style={{ zIndex: 1040 }}
      />

      {/* Modal */}
      <div
        className="modal d-block"
        role="dialog"
        aria-modal="true"
        style={{ zIndex: 1050 }}
      >
        <div className={`modal-dialog modal-dialog-centered ${sizeClass}`}>
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title fw-semibold" style={{ color: '#0d1b2a' }}>
                {title}
              </h5>
              <button
                type="button"
                className="btn-close"
                aria-label="Luk"
                onClick={onClose}
              />
            </div>
            <div className="modal-body">{children}</div>
          </div>
        </div>
      </div>
    </>,
    document.body,
  )
}
