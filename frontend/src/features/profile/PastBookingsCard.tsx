import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useGetMyBookingHistoryQuery } from '../laundry/laundryApi'
import { BookingRow } from './BookingRow'
import { BOOKING_HISTORY_DAYS, PAST_BOOKINGS_PREVIEW } from './constants'
import { EmptyState, ErrorState, Spinner } from '../../shared/ui'
import { colors } from '../../shared/theme'

interface Props {
  propertyId: string
}

export function PastBookingsCard({ propertyId }: Props) {
  const { t } = useTranslation()
  const { data: past = [], isLoading, isError, refetch } = useGetMyBookingHistoryQuery(propertyId)
  const [showAll, setShowAll] = useState(false)
  const shown = showAll ? past : past.slice(0, PAST_BOOKINGS_PREVIEW)

  function body() {
    if (isLoading) return <Spinner />
    if (isError) return <ErrorState title={t('common.genericError')} onRetry={refetch} />
    if (past.length === 0) return <EmptyState title={t('profile.noPastBookings')} />
    return (
      <>
        {shown.map(b => <BookingRow key={b.id} booking={b} cancelling={false} />)}
        {past.length > PAST_BOOKINGS_PREVIEW && (
          <button type="button" className="btn btn-link btn-sm px-0" onClick={() => setShowAll(v => !v)}>
            {showAll ? t('profile.showFewerPast') : t('profile.showAllPast', { count: past.length })}
          </button>
        )}
      </>
    )
  }

  return (
    <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
      <div className="card-body p-4">
        <div className="d-flex flex-wrap justify-content-between align-items-baseline gap-2 mb-3">
          <h5 className="mb-0" style={{ fontWeight: 600, color: colors.textPrimary }}>{t('profile.pastBookings')}</h5>
          <span style={{ fontSize: '0.8rem', color: colors.textSecondary }}>
            {t('profile.pastBookingsPeriod', { days: BOOKING_HISTORY_DAYS })}
          </span>
        </div>
        {body()}
      </div>
    </div>
  )
}
