import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { skipToken } from '@reduxjs/toolkit/query/react'
import { useMeQuery } from '../features/auth/authApi'
import { useGetPropertyInfoQuery } from '../features/properties/propertiesApi'
import { PropertyBoardCard } from '../features/properties/PropertyBoardCard'
import { PropertyRoomsCard } from '../features/properties/PropertyRoomsCard'
import { BookingRulesList } from '../features/laundry/BookingRulesList'
import { OVERVIEW_CARD } from '../features/properties/constants'
import { PageHeader, ErrorState, Spinner } from '../shared/ui'
import { colors } from '../shared/theme'

export function PropertyInfoPage() {
  const { t } = useTranslation()
  const pickerId = useId()
  const { data: user } = useMeQuery()
  const memberships = user?.memberships ?? []
  const [picked, setPicked] = useState<string | null>(null)
  const propertyId = memberships.some(m => m.propertyId === picked) ? picked : (memberships[0]?.propertyId ?? null)
  const info = useGetPropertyInfoQuery(propertyId ?? skipToken)

  if (!propertyId) {
    return (
      <div className="container-xl px-4 py-5">
        <PageHeader title={t('nav.propertyInfo')} description={t('laundryPage.notLinkedDescription')} />
      </div>
    )
  }

  const data = info.data

  return (
    <div className="container-xl px-4 py-5">
      <PageHeader eyebrow={t('nav.propertyInfo')} title={data?.name ?? t('nav.propertyInfo')} description={t('propertyInfo.description')} />

      {memberships.length > 1 && (
        <div className="mb-4" style={{ maxWidth: 320 }}>
          <label htmlFor={pickerId} className="form-label" style={{ fontSize: '0.85rem', color: colors.textSecondary }}>{t('propertyInfo.pick')}</label>
          <select id={pickerId} className="form-select" value={propertyId} onChange={e => setPicked(e.target.value)}>
            {memberships.map(m => <option key={m.propertyId} value={m.propertyId}>{m.propertyName}</option>)}
          </select>
        </div>
      )}

      {info.isError ? (
        <ErrorState title={t('propertyInfo.loadErrorTitle')} description={t('laundryPage.loadErrorDescription')} onRetry={info.refetch} />
      ) : !data ? (
        <Spinner fullPage />
      ) : (
        <div className="row g-4">
          <div className="col-12 col-lg-8 d-flex flex-column gap-4">
            <section style={OVERVIEW_CARD}>
              <h2 style={{ margin: '0 0 10px', fontSize: '1rem', fontWeight: 700, color: colors.textPrimary }}>{t('propertyInfo.rules.title')}</h2>
              <BookingRulesList
                rules={{
                  lookaheadDays: data.settings.bookingLookaheadDays,
                  maxBookings: data.settings.maxConcurrentBookingsPerUser,
                  cancellationWindowMinutes: data.settings.cancellationWindowMinutes,
                }}
                bookingMode={data.settings.bookingMode}
                fontSize="0.9rem"
              />
            </section>
            <PropertyRoomsCard rooms={data.rooms} />
          </div>
          <div className="col-12 col-lg-4">
            <PropertyBoardCard board={data.board} address={data.address} />
          </div>
        </div>
      )}
    </div>
  )
}
