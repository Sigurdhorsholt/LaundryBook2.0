import { useTranslation } from 'react-i18next'
import { useLaundryBooking } from '../../features/laundry/useLaundryBooking'
import { DayBookingsSummary } from '../../features/laundry/DayBookingsSummary'
import { RoomSelector } from '../../features/laundry/RoomSelector'
import { DayBookingView } from '../../features/laundry/DayBookingView'
import { WeekBookingView } from '../../features/laundry/WeekBookingView'
import { BookingSidePanel } from '../../features/laundry/BookingSidePanel'
import { RoomInfoDisclosure } from '../../features/laundry/RoomInfoDisclosure'
import { ConfirmBookingModal } from '../../features/laundry/ConfirmBookingModal'
import { PageHeader, EmptyState, ErrorState } from '../../shared/ui'
import { useMediaQuery } from '../../shared/utils/useMediaQuery'
import { MEDIA_LG, MEDIA_XL } from '../../shared/constants'
import { colors } from '../../shared/theme'

export function LaundryPage() {
  const { t } = useTranslation()
  const lb = useLaundryBooking()
  // The whole week needs ~950px; below that the day view (date strip + slot list) is the better fit
  const showWeek = useMediaQuery(MEDIA_LG)
  const panelBeside = useMediaQuery(MEDIA_XL)

  if (!lb.propertyId) {
    return (
      <div className="container-xl px-4 py-5">
        <PageHeader title={t('nav.laundry')} description={t('laundryPage.notLinkedDescription')} />
      </div>
    )
  }

  if (lb.property.isError || lb.rooms.isError) {
    return (
      <div className="container-xl px-4 py-5">
        <PageHeader title={t('nav.laundry')} description={t('laundryPage.description')} />
        <ErrorState
          title={t('laundryPage.loadErrorTitle')}
          description={t('laundryPage.loadErrorDescription')}
          onRetry={() => {
            if (lb.property.isError) lb.property.refetch()
            if (lb.rooms.isError) lb.rooms.refetch()
          }}
        />
      </div>
    )
  }

  const rooms = lb.rooms.data ?? []
  const noRooms = lb.rooms.data !== undefined && rooms.length === 0

  return (
    <div className={showWeek ? 'container-fluid px-4 py-5' : 'container-xl px-4 py-5'} style={showWeek ? { maxWidth: 1440 } : undefined}>
      <PageHeader eyebrow={lb.property.data?.name} title={t('nav.laundry')} description={t('laundryPage.description')} />

      {!showWeek && <DayBookingsSummary booking={lb} />}

      {noRooms && (
        <EmptyState title={t('laundryPage.noRoomsTitle')} description={t('laundryPage.noRoomsDescription')} />
      )}

      {lb.rooms.isLoading ? (
        <div className="mb-4">
          <div style={{ width: 120, height: 32, borderRadius: 20, backgroundColor: colors.borderDefault, display: 'inline-block' }} />
        </div>
      ) : (
        <RoomSelector rooms={rooms} selectedRoomId={lb.selectedRoomId} onSelect={lb.selectRoom} />
      )}

      {!noRooms && (showWeek ? (
        <div style={{ display: 'flex', flexDirection: panelBeside ? 'row' : 'column', alignItems: panelBeside ? 'flex-start' : 'stretch', gap: 24 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <WeekBookingView booking={lb} />
          </div>
          <BookingSidePanel booking={lb} layout={panelBeside ? 'column' : 'row'} />
        </div>
      ) : (
        <>
          <DayBookingView booking={lb} showRoomName={rooms.length === 1} />
          {lb.selectedRoom && lb.roomRules && (
            <div className="mt-3">
              <RoomInfoDisclosure room={lb.selectedRoom} machines={lb.machines} rules={lb.roomRules} houseRules={lb.houseRules} />
            </div>
          )}
        </>
      ))}

      {lb.pending && lb.pending.source !== 'grid' && (
        <ConfirmBookingModal
          pending={lb.pending}
          error={lb.confirmError}
          loading={lb.confirmLoading}
          onConfirm={lb.handleConfirm}
          onClose={lb.dismissConfirm}
        />
      )}
    </div>
  )
}
