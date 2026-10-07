import { useTranslation } from 'react-i18next'
import type { MyBookingDto } from '../laundry/laundryApi'
import { colors } from '../../shared/theme'
import { formatDateFull, formatTimeRange } from '../../shared/utils/dateUtils'

interface Props {
  booking: MyBookingDto
  onCancel?: () => void
  onAddToCalendar?: () => void
  cancelling: boolean
}

export function BookingRow({ booking, onCancel, onAddToCalendar, cancelling }: Props) {
  const { t } = useTranslation()
  return (
    <div
      className="d-flex flex-wrap align-items-center justify-content-between gap-2 py-2 px-3"
      style={{ borderRadius: 8, backgroundColor: colors.bgMuted, marginBottom: 6 }}
    >
      <div style={{ flex: '1 1 180px', minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: '0.88rem', color: colors.textPrimary }}>
          {[booking.roomName, booking.machineName].filter(Boolean).join(' · ')}
        </div>
        <div style={{ fontSize: '0.8rem', color: colors.textSecondary }}>
          {formatDateFull(booking.date)} · {formatTimeRange(booking.startTime, booking.endTime)}
        </div>
      </div>
      {/* On a phone the buttons drop below the text instead of squeezing it */}
      <div className="d-flex gap-2" style={{ whiteSpace: 'nowrap' }}>
        {onAddToCalendar && (
          <button
            className="btn btn-sm"
            style={{ borderRadius: 7, fontSize: '0.78rem', color: colors.textPrimary, border: `1px solid ${colors.borderDefault}`, backgroundColor: colors.bgCard }}
            onClick={onAddToCalendar}
          >
            {t('laundry.calendarFile.add')}
          </button>
        )}
        {onCancel && booking.canCancel && (
          <button
            className="btn btn-sm"
            style={{
              borderRadius: 7,
              fontSize: '0.78rem',
              color: colors.dangerText,
              border: `1px solid ${colors.dangerBorder}`,
              backgroundColor: colors.dangerBg,
            }}
            onClick={onCancel}
            disabled={cancelling}
          >
            {t('profile.cancelBooking')}
          </button>
        )}
      </div>
    </div>
  )
}
