import { useTranslation } from 'react-i18next'
import { AdminBookingsList } from '../../../features/laundry/AdminBookingsList'
import { PageHeader } from '../../../shared/ui'
import { todayStr } from '../../../shared/utils/dateUtils'
import { BrowserFrame } from './BrowserFrame'
import { PreviewAppBar } from './PreviewAppBar'
import { PREVIEW_PROPERTY, previewAdminBookings } from './previewData'

const noop = () => {}

// The admin's real bookings list, where any booking can be cancelled, with made-up bookings
export function AdminBookingsPreview() {
  const { t } = useTranslation()
  const today = todayStr()

  return (
    <BrowserFrame label={t('public.previews.bookingsAlt')} url="laundrybook.dk/admin/bookings" designWidth={1000}>
      <PreviewAppBar admin active={1} />
      <div style={{ padding: '28px 32px' }}>
        <PageHeader eyebrow={PREVIEW_PROPERTY} title={t('adminProperties.bookings.title')} />
        <AdminBookingsList bookings={previewAdminBookings(today)} today={today} onCancel={noop} />
      </div>
    </BrowserFrame>
  )
}
