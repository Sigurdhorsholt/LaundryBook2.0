import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MachineType, useCreateMachineMutation, useUpdateMachineMutation, type LaundryMachineDto } from './laundryApi'
import { ADMIN_MACHINE_TYPE_OPTION_LABEL, MACHINE_TYPES } from './constants'
import { ModalShell } from '../../shared/modals/ModalShell'
import { Callout, FormError, FormLabel } from '../../shared/ui'

interface Props {
  roomId: string
  roomName: string
  machine?: LaundryMachineDto   // editing this machine; adding a new one when left out
  // Set when the room was created a moment ago, so the admin knows why this opened
  roomJustCreated?: boolean
  onClose: () => void
}

export function MachineFormModal({ roomId, roomName, machine, roomJustCreated, onClose }: Props) {
  const { t } = useTranslation()
  const formId = useId()
  const [name, setName] = useState(machine?.name ?? '')
  const [machineType, setMachineType] = useState<MachineType>(machine?.machineType ?? MachineType.Washer)
  const [error, setError] = useState<string | null>(null)
  const [createMachine, { isLoading: creating }] = useCreateMachineMutation()
  const [updateMachine, { isLoading: saving }] = useUpdateMachineMutation()
  const busy = creating || saving

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      if (machine) await updateMachine({ roomId, machineId: machine.id, name: name.trim(), machineType }).unwrap()
      else await createMachine({ roomId, name: name.trim(), machineType }).unwrap()
      onClose()
    } catch {
      setError(t(machine ? 'adminProperties.laundryRooms.saveError' : 'adminProperties.laundryRooms.createMachineError'))
    }
  }

  return (
    <ModalShell
      title={machine ? t('adminProperties.laundryRooms.editMachine') : t('adminProperties.laundryRooms.addMachineTitle', { room: roomName })}
      onClose={onClose}
      size="sm"
    >
      <form onSubmit={handleSubmit}>
        {roomJustCreated && <div className="mb-3"><Callout>{t('adminProperties.laundryRooms.roomCreatedAddMachine')}</Callout></div>}
        <div className="mb-3">
          <FormLabel htmlFor={`${formId}-name`}>{t('adminProperties.laundryRooms.nameLabel')}</FormLabel>
          <input
            id={`${formId}-name`}
            className="form-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={100}
            placeholder={machine ? undefined : t('adminProperties.laundryRooms.machineNamePlaceholder')}
            autoFocus
          />
        </div>
        <div className="mb-3">
          <FormLabel htmlFor={`${formId}-type`}>{t('adminProperties.laundryRooms.typeLabel')}</FormLabel>
          <select
            id={`${formId}-type`}
            className="form-select"
            value={machineType}
            onChange={(e) => setMachineType(Number(e.target.value) as MachineType)}
          >
            {MACHINE_TYPES.map((type) => <option key={type} value={type}>{t(ADMIN_MACHINE_TYPE_OPTION_LABEL[type])}</option>)}
          </select>
        </div>
        <FormError message={error} />
        <div className="d-flex justify-content-end gap-2 mt-4">
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>{t('common.cancel')}</button>
          <button type="submit" className="btn btn-primary fw-semibold" disabled={busy || !name.trim()}>
            {machine
              ? (saving ? t('adminProperties.laundryRooms.saving') : t('adminProperties.laundryRooms.saveChanges'))
              : (creating ? t('adminProperties.laundryRooms.creating') : t('adminProperties.laundryRooms.createMachine'))}
          </button>
        </div>
      </form>
    </ModalShell>
  )
}
