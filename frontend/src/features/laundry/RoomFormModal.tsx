import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useCreateLaundryRoomMutation, useUpdateLaundryRoomMutation, type LaundryRoomDto } from './laundryApi'
import { ModalShell } from '../../shared/modals/ModalShell'
import { FormError, FormLabel } from '../../shared/ui'

interface Props {
  propertyId: string
  room?: LaundryRoomDto   // editing this room; creating a new one when left out
  onClose: () => void
  onCreated?: (room: { id: string; name: string }) => void
}

export function RoomFormModal({ propertyId, room, onClose, onCreated }: Props) {
  const { t } = useTranslation()
  const formId = useId()
  const [name, setName] = useState(room?.name ?? '')
  const [description, setDescription] = useState(room?.description ?? '')
  const [error, setError] = useState<string | null>(null)
  const [createRoom, { isLoading: creating }] = useCreateLaundryRoomMutation()
  const [updateRoom, { isLoading: saving }] = useUpdateLaundryRoomMutation()
  const busy = creating || saving

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const values = { propertyId, name: name.trim(), description: description.trim() || null }
    try {
      if (room) {
        await updateRoom({ ...values, roomId: room.id }).unwrap()
        onClose()
      } else {
        const { id } = await createRoom(values).unwrap()
        if (onCreated) onCreated({ id, name: values.name })
        else onClose()
      }
    } catch {
      setError(t(room ? 'adminProperties.laundryRooms.saveError' : 'adminProperties.laundryRooms.createRoomError'))
    }
  }

  return (
    <ModalShell title={t(room ? 'adminProperties.laundryRooms.editRoom' : 'adminProperties.laundryRooms.addRoom')} onClose={onClose} size="sm">
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <FormLabel htmlFor={`${formId}-name`}>{t('adminProperties.laundryRooms.nameLabel')}</FormLabel>
          <input
            id={`${formId}-name`}
            className="form-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={200}
            placeholder={room ? undefined : t('adminProperties.laundryRooms.roomNamePlaceholder')}
            autoFocus
          />
        </div>
        <div className="mb-3">
          <FormLabel htmlFor={`${formId}-description`}>{t('adminProperties.laundryRooms.descriptionLabel')}</FormLabel>
          <input
            id={`${formId}-description`}
            className="form-control"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={500}
            placeholder={room ? undefined : t('adminProperties.laundryRooms.descriptionPlaceholder')}
          />
        </div>
        <FormError message={error} />
        <div className="d-flex justify-content-end gap-2 mt-4">
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>{t('common.cancel')}</button>
          <button type="submit" className="btn btn-primary fw-semibold" disabled={busy || !name.trim()}>
            {room
              ? (saving ? t('adminProperties.laundryRooms.saving') : t('adminProperties.laundryRooms.saveChanges'))
              : (creating ? t('adminProperties.laundryRooms.creating') : t('adminProperties.laundryRooms.createRoom'))}
          </button>
        </div>
      </form>
    </ModalShell>
  )
}
