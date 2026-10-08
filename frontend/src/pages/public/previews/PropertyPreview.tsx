import { useTranslation } from 'react-i18next'
import { HouseRulesCard } from '../../../features/properties/HouseRulesCard'
import { PropertyRoomsCard } from '../../../features/properties/PropertyRoomsCard'
import { PropertyBoardCard } from '../../../features/properties/PropertyBoardCard'
import { BookingRulesList } from '../../../features/laundry/BookingRulesList'
import { OVERVIEW_CARD } from '../../../features/properties/constants'
import { PageHeader } from '../../../shared/ui'
import { colors } from '../../../shared/theme'
import { BrowserFrame } from './BrowserFrame'
import { PreviewAppBar } from './PreviewAppBar'
import { previewPropertyInfo as info } from './previewData'

// The resident's property page (Ejendommen) with made-up content
export function PropertyPreview() {
  const { t } = useTranslation()

  return (
    <BrowserFrame label={t('public.previews.propertyAlt')} url="laundrybook.dk/property" designWidth={1000}>
      <PreviewAppBar active={1} />
      <div style={{ padding: '28px 32px' }}>
        <PageHeader eyebrow={t('nav.propertyInfo')} title={info.name} description={t('propertyInfo.description')} />
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, alignItems: 'start' }}>
          <div className="d-flex flex-column gap-4">
            {/* No date: a date would mark these rules as seen in the visitor's browser */}
            <HouseRulesCard propertyId={info.id} text={info.houseRules ?? ''} updatedAt={null} />
            <section style={OVERVIEW_CARD}>
              <h2 style={{ margin: '0 0 10px', fontSize: '1rem', fontWeight: 700, color: colors.textPrimary }}>{t('propertyInfo.rules.title')}</h2>
              <BookingRulesList
                rules={{
                  lookaheadDays: info.settings.bookingLookaheadDays,
                  maxBookings: info.settings.maxConcurrentBookingsPerUser,
                  cancellationWindowMinutes: info.settings.cancellationWindowMinutes,
                }}
                bookingMode={info.settings.bookingMode}
                fontSize="0.9rem"
              />
            </section>
            <PropertyRoomsCard rooms={info.rooms} />
          </div>
          <PropertyBoardCard board={info.board} address={info.address} />
        </div>
      </div>
    </BrowserFrame>
  )
}
