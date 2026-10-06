import { useId, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { colors } from '../theme'
import { useDialog } from './useDialog'

interface ModalShellProps {
  title: string
  onClose: () => void
  children: ReactNode
  size?: 'sm' | 'md' | 'lg'
  // false while a request is running, so Escape/outside click can't drop its result
  closable?: boolean
}

export function ModalShell({ title, onClose, children, size = 'md', closable = true }: ModalShellProps) {
  const { t } = useTranslation()
  const titleId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)
  useDialog(dialogRef, onClose, closable)
  const sizeClass = size === 'sm' ? 'modal-sm' : size === 'lg' ? 'modal-lg' : ''

  return createPortal(
    <>
      <div className="modal-backdrop fade show" style={{ zIndex: 1040 }} />

      {/* Bootstrap's .modal covers the whole viewport, so outside clicks land here, not on the backdrop */}
      <div
        className="modal d-block"
        style={{ zIndex: 1050 }}
        onMouseDown={(e) => { if (e.target === e.currentTarget && closable) onClose() }}
      >
        <div className={`modal-dialog modal-dialog-centered ${sizeClass}`}>
          <div
            ref={dialogRef}
            className="modal-content"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
          >
            <div className="modal-header">
              <h5 id={titleId} className="modal-title fw-semibold" style={{ color: colors.textPrimary }}>
                {title}
              </h5>
              <button
                type="button"
                className="btn-close"
                aria-label={t('common.close')}
                onClick={onClose}
                disabled={!closable}
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
