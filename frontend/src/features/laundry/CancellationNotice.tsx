import { useTranslation } from 'react-i18next'
import { useGetCancellationNoticesQuery, useAcknowledgeCancellationNoticesMutation } from './laundryApi'
import { Callout } from '../../shared/ui'
import { formatDateFull, formatTimeRange } from '../../shared/utils/dateUtils'
import { colors } from '../../shared/theme'
import { TAP_TARGET_PX } from './constants'

// Admin cancellations were silent: the booking just vanished. This tells the resident once.
export function CancellationNotice() {
  const { t } = useTranslation()
  const { data: notices = [] } = useGetCancellationNoticesQuery(undefined, { refetchOnFocus: true })
  const [acknowledge, { isLoading }] = useAcknowledgeCancellationNoticesMutation()
  if (notices.length === 0) return null

  return (
    <div className="container-xl px-4 pt-4">
      <Callout
        title={t('laundry.cancelNotice.title', { count: notices.length })}
        action={
          <button
            type="button"
            className="btn btn-sm fw-semibold"
            // Bootstrap's grey outline is under 4.5:1 on the amber callout
            style={{ minHeight: TAP_TARGET_PX, borderRadius: 10, backgroundColor: colors.bgCard, color: colors.warningText, border: `1px solid ${colors.warningBorder}` }}
            disabled={isLoading}
            onClick={() => { void acknowledge(notices.map(n => n.bookingId)) }}
          >
            {t('laundry.cancelNotice.ok')}
          </button>
        }
      >
        <ul className="mb-1 ps-3">
          {notices.map(n => (
            <li key={n.bookingId}>
              {t('laundry.cancelNotice.item', { date: formatDateFull(n.date), time: formatTimeRange(n.startTime, n.endTime) })}
              {' · '}
              {[n.roomName, n.machineName].filter(Boolean).join(' · ')}
            </li>
          ))}
        </ul>
        {t('laundry.cancelNotice.body')}
      </Callout>
    </div>
  )
}
