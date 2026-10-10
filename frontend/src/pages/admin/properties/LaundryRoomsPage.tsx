import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import { useGetLaundryRoomsQuery, type LaundryMachineDto, type LaundryRoomDto } from '../../../features/laundry/laundryApi'
import { AdminRoomCard } from '../../../features/laundry/AdminRoomCard'
import { RoomFormModal } from '../../../features/laundry/RoomFormModal'
import { MachineFormModal } from '../../../features/laundry/MachineFormModal'
import { IconPlus } from '../../../shared/icons'
import { PageHeader, EmptyState, Spinner, Notice } from '../../../shared/ui'
import { BookingMode, useGetPropertyQuery } from '../../../features/properties/propertiesApi'
import { colors } from '../../../shared/theme'
import { usePropertyName } from '../../../features/properties/usePropertyName'

type ModalState =
  | null
  | { type: 'addRoom' }
  | { type: 'editRoom'; room: LaundryRoomDto }
  | { type: 'addMachine'; roomId: string; roomName: string; roomJustCreated?: boolean }
  | { type: 'editMachine'; roomId: string; roomName: string; machine: LaundryMachineDto }

export function LaundryRoomsPage() {
  const { t } = useTranslation()
  const { propertyId } = useParams<{ propertyId: string }>()

  const propertyName = usePropertyName(propertyId)

  const { data: rooms = [], isLoading, isError } = useGetLaundryRoomsQuery(propertyId!, { skip: !propertyId })
  const { data: propertyDetail } = useGetPropertyQuery(propertyId!, { skip: !propertyId })
  const needsMachines = propertyDetail?.settings.bookingMode === BookingMode.BookSpecificMachine

  const [modal, setModal] = useState<ModalState>(null)
  const [cancelledNotice, setCancelledNotice] = useState<number | null>(null)

  function handleDeleted(cancelledBookings: number) {
    setCancelledNotice(cancelledBookings > 0 ? cancelledBookings : null)
  }

  if (isLoading) return <Spinner fullPage />

  if (isError) {
    return (
      <div className="p-4 p-lg-5">
        <p style={{ color: colors.dangerText, fontSize: '0.9rem' }}>
          {t('adminProperties.laundryRooms.loadError')}
        </p>
      </div>
    )
  }

  return (
    <div className="p-4 p-lg-5">
      <PageHeader
        eyebrow={propertyName}
        title={t('adminProperties.laundryRooms.title')}
        description={t('adminProperties.laundryRooms.description')}
        action={
          <button
            className="btn btn-primary btn-sm d-flex align-items-center gap-2 fw-semibold"
            style={{ borderRadius: 8 }}
            onClick={() => setModal({ type: 'addRoom' })}
          >
            <IconPlus size={15} />
            <span className="d-none d-sm-inline">{t('adminProperties.laundryRooms.addRoom')}</span>
            <span className="d-sm-none">{t('adminProperties.laundryRooms.add')}</span>
          </button>
        }
      />

      {cancelledNotice != null && (
        <Notice onDismiss={() => setCancelledNotice(null)}>
          {t('common.upcomingBookingsCancelled', { count: cancelledNotice })}
        </Notice>
      )}

      {rooms.length === 0 ? (
        <EmptyState
          title={t('adminProperties.laundryRooms.emptyTitle')}
          description={t('adminProperties.laundryRooms.emptyDescription')}
          action={
            <button className="btn btn-primary btn-sm fw-semibold" onClick={() => setModal({ type: 'addRoom' })}>
              {t('adminProperties.laundryRooms.addRoom')}
            </button>
          }
        />
      ) : (
        // Two rooms side by side on wide screens; align-items-start so a room with more machines doesn't stretch its neighbour
        <div className="row g-3 align-items-start">
          {rooms.map((room) => (
            <div key={room.id} className="col-12 col-xl-6">
              <AdminRoomCard
                room={room}
                propertyId={propertyId!}
                showNoMachinesWarning={needsMachines && room.machineCount === 0}
                onEdit={() => setModal({ type: 'editRoom', room })}
                onAddMachine={() => setModal({ type: 'addMachine', roomId: room.id, roomName: room.name })}
                onEditMachine={(machine) => setModal({ type: 'editMachine', roomId: room.id, roomName: room.name, machine })}
                onDeleted={handleDeleted}
              />
            </div>
          ))}
        </div>
      )}

      {modal?.type === 'addRoom' && (
        <RoomFormModal
          propertyId={propertyId!}
          onClose={() => setModal(null)}
          // A new room has nothing to book until it has machines, so that is the next step
          onCreated={(room) => setModal({ type: 'addMachine', roomId: room.id, roomName: room.name, roomJustCreated: true })}
        />
      )}
      {modal?.type === 'editRoom' && (
        <RoomFormModal propertyId={propertyId!} room={modal.room} onClose={() => setModal(null)} />
      )}
      {(modal?.type === 'addMachine' || modal?.type === 'editMachine') && (
        <MachineFormModal
          key={modal.type === 'editMachine' ? modal.machine.id : `new-${modal.roomId}`}
          roomId={modal.roomId}
          roomName={modal.roomName}
          machine={modal.type === 'editMachine' ? modal.machine : undefined}
          roomJustCreated={modal.type === 'addMachine' && modal.roomJustCreated}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
