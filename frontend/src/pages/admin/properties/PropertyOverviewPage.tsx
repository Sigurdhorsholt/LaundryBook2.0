import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMeQuery } from '../../../features/auth/authApi'
import { usePropertyOverview } from '../../../features/properties/usePropertyOverview'
import { SetupChecklist } from '../../../features/properties/SetupChecklist'
import { OverviewKpis } from '../../../features/properties/OverviewKpis'
import { TodayBookingsCard } from '../../../features/properties/TodayBookingsCard'
import { NeedsAttentionCard } from '../../../features/properties/NeedsAttentionCard'
import { RoomOccupancyCard } from '../../../features/properties/RoomOccupancyCard'
import { useModal } from '../../../shared/modals/useModal'
import { PageHeader, ErrorState, Spinner } from '../../../shared/ui'
import { IconPlus } from '../../../shared/icons'
import { formatDateFull, weekLabel } from '../../../shared/utils/dateUtils'
import { usePropertyName } from '../../../features/properties/usePropertyName'

export function PropertyOverviewPage() {
  const { t } = useTranslation()
  const { propertyId } = useParams<{ propertyId: string }>()
  const { data: user } = useMeQuery()
  const { openModal } = useModal()
  const membership = user?.memberships.find(m => m.propertyId === propertyId)
  const o = usePropertyOverview(propertyId)
  const base = `/admin/properties/${propertyId}`
  const isPendingApproval = membership ? !membership.propertyIsActive : false
  const propertyName = usePropertyName(propertyId)

  return (
    <div className="p-4 p-lg-5">
      <PageHeader
        eyebrow={[propertyName, formatDateFull(o.today), weekLabel(o.weekStart)].filter(Boolean).join(' · ')}
        title={t('nav.overview')}
        action={
          <button
            className="btn btn-primary btn-sm d-flex align-items-center gap-2"
            style={{ borderRadius: 8, fontSize: '0.85rem', minHeight: 40 }}
            onClick={() => openModal('inviteUser', { propertyId: propertyId! })}
            disabled={isPendingApproval}
            title={isPendingApproval ? t('adminProperties.users.pendingApprovalTooltip') : undefined}
          >
            <IconPlus size={14} strokeWidth={2.5} />
            {t('adminOverview.inviteResident')}
          </button>
        }
      />

      {propertyId && membership && <SetupChecklist propertyId={propertyId} propertyName={membership.propertyName} />}

      {o.isError ? (
        <ErrorState title={t('adminOverview.loadErrorTitle')} description={t('laundryPage.loadErrorDescription')} onRetry={o.refetch} />
      ) : o.isLoading ? (
        <Spinner fullPage />
      ) : (
        <>
          <OverviewKpis
            weekCount={o.weekCount}
            weekDelta={o.weekDelta}
            utilization={o.utilization}
            busiestDay={o.busiestDay}
            residents={o.residents}
            pendingInvites={o.pendingInvites}
            todayCount={o.todayBookings.length}
            laterToday={o.laterToday}
          />
          <div className="row g-4">
            <div className="col-12 col-xl-8">
              <TodayBookingsCard bookings={o.todayBookings} bookingsPath={`${base}/bookings`} />
            </div>
            <div className="col-12 col-xl-4 d-flex flex-column gap-4">
              <NeedsAttentionCard items={o.attention} basePath={base} />
              <RoomOccupancyCard rooms={o.perRoom} />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
