import type { AdminCancelTarget } from './types'
import { colors } from '../../shared/theme'

interface Props {
  target: AdminCancelTarget
  cancelling: boolean
  error: string | null
  onConfirm: () => void
  onClose: () => void
}

export function AdminCancelBookingModal({ target, cancelling, error, onConfirm, onClose }: Props) {
  return (
    <>
      <div
        style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.35)', zIndex: 1050 }}
        onClick={cancelling ? undefined : onClose}
      />
      <div
        style={{
          position: 'fixed', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: colors.bgCard, borderRadius: 12, padding: '24px',
          width: 360, maxWidth: 'calc(100vw - 32px)',
          zIndex: 1051, boxShadow: '0 8px 40px rgba(0,0,0,0.15)',
        }}
      >
        <h6 style={{ fontWeight: 700, color: colors.textPrimary, marginBottom: 8, fontSize: '1rem' }}>
          Aflys booking
        </h6>

        <p style={{ fontSize: '0.9rem', color: colors.textSecondary, marginBottom: 6, lineHeight: 1.5 }}>
          Aflys <strong>{target.slotTime}</strong> den {target.dateLabel} i{' '}
          <strong>{target.roomName}</strong>?
        </p>
        <p style={{ fontSize: '0.85rem', color: colors.textMuted, marginBottom: 16 }}>
          Booket af {target.residentName}. Beboeren får frigivet tidspladsen.
        </p>

        {error != null && (
          <p style={{ fontSize: '0.82rem', color: colors.dangerText, marginBottom: 12 }}>
            {error}
          </p>
        )}

        <div className="d-flex gap-2 justify-content-end">
          <button
            className="btn btn-sm btn-outline-secondary"
            style={{ borderRadius: 7, fontSize: '0.82rem' }}
            disabled={cancelling}
            onClick={onClose}
          >
            Behold
          </button>
          <button
            className="btn btn-sm btn-danger fw-semibold"
            style={{ borderRadius: 7, fontSize: '0.82rem' }}
            disabled={cancelling}
            onClick={onConfirm}
          >
            {cancelling ? 'Aflyser…' : 'Aflys booking'}
          </button>
        </div>
      </div>
    </>
  )
}
