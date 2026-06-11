import type { PendingAction } from './types'
import { formatDateFull } from '../../shared/utils/dateUtils'
import { colors } from '../../shared/theme'

interface Props {
  pending: PendingAction
  error: string | null
  loading: boolean
  onConfirm: () => void
  onClose: () => void
}

export function ConfirmBookingModal({ pending, error, loading, onConfirm, onClose }: Props) {
  const isBook   = pending.type === 'book'
  const dateText = formatDateFull(pending.date)

  const showTimeWarning =
    !isBook &&
    pending.minutesUntil !== undefined &&
    pending.minutesUntil >= 0 &&
    pending.minutesUntil < 240

  return (
    <>
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.35)', zIndex: 1040, backdropFilter: 'blur(2px)' }}
      />
      <div
        style={{
          position: 'fixed', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1050, backgroundColor: colors.bgCard, borderRadius: 12,
          boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
          width: 'min(92vw, 380px)', padding: '24px',
        }}
      >
        <h6 style={{ fontWeight: 700, marginBottom: 4, color: colors.textPrimary }}>
          {isBook ? 'Bekræft booking' : 'Aflys booking'}
        </h6>

        <p style={{ color: colors.textSecondary, fontSize: '0.9rem', marginBottom: showTimeWarning ? 10 : 16 }}>
          {isBook
            ? <>Vil du booke <strong>{pending.slotTime}</strong> den <strong>{dateText}</strong>?</>
            : <>Vil du aflyse din booking kl. <strong>{pending.slotTime}</strong> den <strong>{dateText}</strong>?</>
          }
        </p>

        {showTimeWarning && (
          <p style={{
            fontSize: '0.8rem', color: colors.warningText,
            backgroundColor: colors.warningBg, border: `1px solid ${colors.warningBorder}`,
            borderRadius: 6, padding: '6px 10px', marginBottom: 16,
          }}>
            {(pending.minutesUntil ?? 0) < 60
              ? `Der er kun ${pending.minutesUntil} minutter til din booking starter.`
              : `Der er ${Math.floor((pending.minutesUntil ?? 0) / 60)} time${Math.floor((pending.minutesUntil ?? 0) / 60) === 1 ? '' : 'r'} til din booking starter.`
            }
          </p>
        )}

        {error && (
          <div style={{ padding: '8px 12px', backgroundColor: colors.dangerBg, borderRadius: 6, color: colors.dangerText, fontSize: '0.83rem', marginBottom: 16 }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button
            className="btn btn-sm btn-outline-secondary"
            style={{ borderRadius: 20, padding: '5px 16px' }}
            onClick={onClose}
            disabled={loading}
          >
            Luk
          </button>
          <button
            className={`btn btn-sm ${isBook ? 'btn-primary' : 'btn-danger'}`}
            style={{ borderRadius: 20, padding: '5px 20px', minWidth: 80 }}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? <span className="spinner-border spinner-border-sm" /> : isBook ? 'Book' : 'Aflys'}
          </button>
        </div>
      </div>
    </>
  )
}
