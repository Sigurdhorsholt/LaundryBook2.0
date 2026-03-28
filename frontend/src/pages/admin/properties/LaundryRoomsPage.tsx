import { useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  MachineType,
  type LaundryMachineDto,
  type LaundryRoomDto,
  useCreateLaundryRoomMutation,
  useCreateMachineMutation,
  useDeleteLaundryRoomMutation,
  useDeleteMachineMutation,
  useGetLaundryRoomsQuery,
  useGetMachinesQuery,
  useUpdateLaundryRoomMutation,
  useUpdateMachineMutation,
} from '../../../features/laundry/laundryApi'
import { ModalShell } from '../../../shared/modals/ModalShell'
import { IconPlus } from '../../../shared/icons'
import { useMeQuery } from '../../../features/auth/authApi'
import { PageHeader, EmptyState, Spinner, FormError } from '../../../shared/ui'
import { colors } from '../../../shared/theme'

const MACHINE_TYPE_LABEL: Record<MachineType, string> = {
  [MachineType.Washer]: 'Vaskemaskine',
  [MachineType.Dryer]: 'Tørretumbler',
  [MachineType.WasherDryer]: 'Kombi',
}

const MACHINE_TYPE_OPTIONS: { value: MachineType; label: string }[] = [
  { value: MachineType.Washer, label: 'Vaskemaskine' },
  { value: MachineType.Dryer, label: 'Tørretumbler' },
  { value: MachineType.WasherDryer, label: 'Kombi (vask+tørr)' },
]

type ModalState =
  | null
  | { type: 'addRoom' }
  | { type: 'editRoom'; room: LaundryRoomDto }
  | { type: 'addMachine'; roomId: string; roomName: string }
  | { type: 'editMachine'; roomId: string; machine: LaundryMachineDto }

export function LaundryRoomsPage() {
  const { propertyId } = useParams<{ propertyId: string }>()
  const { data: user } = useMeQuery()

  const property = user?.memberships?.find((m) => m.propertyId === propertyId)

  const { data: rooms = [], isLoading, isError } = useGetLaundryRoomsQuery(propertyId!, { skip: !propertyId })

  const [expandedRoomId, setExpandedRoomId] = useState<string | null>(null)
  const [modal, setModal] = useState<ModalState>(null)

  function toggleExpand(roomId: string) {
    setExpandedRoomId((prev) => (prev === roomId ? null : roomId))
  }

  if (isLoading) return <Spinner fullPage />

  if (isError) {
    return (
      <div className="p-4 p-lg-5">
        <p style={{ color: '#dc3545', fontSize: '0.9rem' }}>
          Kunne ikke indlæse lokaler. Prøv at genindlæse siden.
        </p>
      </div>
    )
  }

  return (
    <div className="p-4 p-lg-5">
      <PageHeader
        eyebrow={property?.propertyName}
        title="Lokaler & Maskiner"
        description="Administrer vaskerum og maskiner for denne ejendom."
        action={
          <button
            className="btn btn-primary btn-sm d-flex align-items-center gap-2 fw-semibold"
            style={{ borderRadius: 8 }}
            onClick={() => setModal({ type: 'addRoom' })}
          >
            <IconPlus size={15} />
            <span className="d-none d-sm-inline">Tilføj lokale</span>
            <span className="d-sm-none">Tilføj</span>
          </button>
        }
      />

      {/* Room list */}
      {rooms.length === 0 ? (
        <EmptyState
          title="Ingen lokaler endnu"
          description='Klik "Tilføj lokale" for at oprette dit første vaskerum.'
        />
      ) : (
        <div className="d-flex flex-column gap-3">
          {rooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              propertyId={propertyId!}
              isExpanded={expandedRoomId === room.id}
              onToggleExpand={() => toggleExpand(room.id)}
              onEdit={() => setModal({ type: 'editRoom', room })}
              onAddMachine={() => setModal({ type: 'addMachine', roomId: room.id, roomName: room.name })}
              onEditMachine={(machine) => setModal({ type: 'editMachine', roomId: room.id, machine })}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {modal?.type === 'addRoom' && (
        <AddRoomModal propertyId={propertyId!} onClose={() => setModal(null)} />
      )}
      {modal?.type === 'editRoom' && (
        <EditRoomModal propertyId={propertyId!} room={modal.room} onClose={() => setModal(null)} />
      )}
      {modal?.type === 'addMachine' && (
        <AddMachineModal roomId={modal.roomId} roomName={modal.roomName} onClose={() => setModal(null)} />
      )}
      {modal?.type === 'editMachine' && (
        <EditMachineModal roomId={modal.roomId} machine={modal.machine} onClose={() => setModal(null)} />
      )}
    </div>
  )
}

// ── RoomCard ───────────────────────────────────────────────────────────────────

function RoomCard({
  room,
  propertyId,
  isExpanded,
  onToggleExpand,
  onEdit,
  onAddMachine,
  onEditMachine,
}: {
  room: LaundryRoomDto
  propertyId: string
  isExpanded: boolean
  onToggleExpand: () => void
  onEdit: () => void
  onAddMachine: () => void
  onEditMachine: (machine: LaundryMachineDto) => void
}) {
  const [deleteRoom] = useDeleteLaundryRoomMutation()
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDelete() {
    setIsDeleting(true)
    try {
      await deleteRoom({ propertyId, roomId: room.id }).unwrap()
    } catch {
      setIsDeleting(false)
      setIsConfirmingDelete(false)
    }
  }

  return (
    <div style={{ border: `1.5px solid ${colors.borderDefault}`, borderRadius: 12, backgroundColor: colors.bgCard, overflow: 'hidden' }}>

      {/* Clickable info row — tap anywhere to expand/collapse */}
      <button
        onClick={onToggleExpand}
        style={{
          display: 'block',
          width: '100%',
          background: 'none',
          border: 'none',
          textAlign: 'left',
          padding: '16px 20px',
          cursor: 'pointer',
        }}
      >
        <div className="d-flex align-items-start justify-content-between gap-2">
          <div style={{ minWidth: 0 }}>
            <div className="fw-semibold" style={{ fontSize: '1rem', color: colors.textPrimary }}>
              {room.name}
            </div>
            {room.description && (
              <div style={{ fontSize: '0.82rem', color: colors.textSecondary, marginTop: 2 }}>
                {room.description}
              </div>
            )}
          </div>
          <span style={{ fontSize: '0.75rem', color: colors.textMuted, flexShrink: 0, paddingTop: 3 }}>
            {isExpanded ? '▲' : '▼'}
          </span>
        </div>
        <div className="mt-2">
          <span
            style={{
              display: 'inline-block',
              fontSize: '0.75rem',
              color: colors.textSecondary,
              backgroundColor: colors.bgSubtle,
              borderRadius: 20,
              padding: '2px 10px',
              fontWeight: 500,
            }}
          >
            {room.machineCount} maskine{room.machineCount !== 1 ? 'r' : ''}
          </span>
        </div>
      </button>

      {/* Action row */}
      <div
        className="d-flex align-items-center gap-2 px-4 pb-3 flex-wrap"
        style={{ borderTop: `1px solid ${colors.borderRow}` }}
      >
        {isConfirmingDelete ? (
          <>
            <button
              className="btn btn-danger btn-sm"
              disabled={isDeleting}
              onClick={handleDelete}
              style={{ fontSize: '0.82rem' }}
            >
              {isDeleting ? 'Sletter…' : 'Bekræft slet'}
            </button>
            <button
              className="btn btn-outline-secondary btn-sm"
              disabled={isDeleting}
              onClick={() => setIsConfirmingDelete(false)}
              style={{ fontSize: '0.82rem' }}
            >
              Annuller
            </button>
          </>
        ) : (
          <>
            <button
              className="btn btn-outline-secondary btn-sm"
              style={{ fontSize: '0.82rem' }}
              onClick={onEdit}
            >
              Rediger lokale
            </button>
            <button
              className="btn btn-outline-danger btn-sm"
              style={{ fontSize: '0.82rem' }}
              onClick={() => setIsConfirmingDelete(true)}
            >
              Slet
            </button>
          </>
        )}
      </div>

      {/* Machines section */}
      {isExpanded && (
        <div style={{ borderTop: `1.5px solid ${colors.borderDefault}`, backgroundColor: colors.bgPage }}>
          <MachineList roomId={room.id} propertyId={propertyId} onEdit={onEditMachine} />
          <div className="px-4 pb-3 pt-2">
            <button
              className="btn btn-sm d-flex align-items-center gap-1"
              style={{ fontSize: '0.82rem', color: colors.primary, fontWeight: 500 }}
              onClick={onAddMachine}
            >
              <IconPlus size={13} color={colors.primary} />
              Tilføj maskine
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── MachineList ────────────────────────────────────────────────────────────────

function MachineList({
  roomId,
  propertyId,
  onEdit,
}: {
  roomId: string
  propertyId: string
  onEdit: (machine: LaundryMachineDto) => void
}) {
  const { data: machines = [], isLoading } = useGetMachinesQuery(roomId)

  if (isLoading) return <Spinner />

  if (machines.length === 0) {
    return (
      <div className="px-4 py-3" style={{ fontSize: '0.85rem', color: colors.textMuted }}>
        Ingen maskiner. Tilføj den første maskine nedenfor.
      </div>
    )
  }

  return (
    <div className="table-responsive">
      <table className="table table-hover mb-0" style={{ fontSize: '0.85rem' }}>
        <thead>
          <tr style={{ backgroundColor: colors.bgSubtle }}>
            <th className="px-4 py-2" style={thStyle}>Navn</th>
            <th className="px-4 py-2 d-none d-sm-table-cell" style={thStyle}>Type</th>
            <th className="px-4 py-2" style={{ ...thStyle, width: 1, whiteSpace: 'nowrap' }}></th>
          </tr>
        </thead>
        <tbody>
          {machines.map((machine) => (
            <MachineRow key={machine.id} machine={machine} roomId={roomId} propertyId={propertyId} onEdit={onEdit} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── MachineRow ─────────────────────────────────────────────────────────────────

function MachineRow({
  machine,
  roomId,
  propertyId,
  onEdit,
}: {
  machine: LaundryMachineDto
  roomId: string
  propertyId: string
  onEdit: (machine: LaundryMachineDto) => void
}) {
  const [deleteMachine] = useDeleteMachineMutation()
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDelete() {
    setIsDeleting(true)
    try {
      await deleteMachine({ roomId, machineId: machine.id, propertyId }).unwrap()
    } catch {
      setIsDeleting(false)
      setIsConfirmingDelete(false)
    }
  }

  return (
    <tr>
      <td className="px-4 py-2 align-middle">
        <div style={{ fontWeight: 500, color: colors.textPrimary }}>{machine.name}</div>
        <div className="d-sm-none" style={{ fontSize: '0.78rem', color: colors.textMuted, marginTop: 1 }}>
          {MACHINE_TYPE_LABEL[machine.machineType]}
        </div>
      </td>
      <td className="px-4 py-2 align-middle d-none d-sm-table-cell" style={{ color: colors.textSecondary }}>
        {MACHINE_TYPE_LABEL[machine.machineType]}
      </td>
      <td className="px-4 py-2 align-middle" style={{ whiteSpace: 'nowrap', textAlign: 'right' }}>
        {isConfirmingDelete ? (
          <span className="d-flex align-items-center justify-content-end gap-2 flex-wrap">
            <button
              className="btn btn-danger btn-sm"
              disabled={isDeleting}
              onClick={handleDelete}
              style={{ fontSize: '0.78rem' }}
            >
              {isDeleting ? 'Sletter…' : 'Bekræft'}
            </button>
            <button
              className="btn btn-outline-secondary btn-sm"
              disabled={isDeleting}
              onClick={() => setIsConfirmingDelete(false)}
              style={{ fontSize: '0.78rem' }}
            >
              Annuller
            </button>
          </span>
        ) : (
          <span className="d-flex align-items-center justify-content-end gap-2">
            <button
              className="btn btn-outline-secondary btn-sm"
              style={{ fontSize: '0.78rem' }}
              onClick={() => onEdit(machine)}
            >
              Rediger
            </button>
            <button
              className="btn btn-outline-danger btn-sm"
              style={{ fontSize: '0.78rem' }}
              onClick={() => setIsConfirmingDelete(true)}
            >
              Slet
            </button>
          </span>
        )}
      </td>
    </tr>
  )
}

// ── Modals ─────────────────────────────────────────────────────────────────────

function AddRoomModal({ propertyId, onClose }: { propertyId: string; onClose: () => void }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [createRoom, { isLoading }] = useCreateLaundryRoomMutation()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      await createRoom({ propertyId, name: name.trim(), description: description.trim() || null }).unwrap()
      onClose()
    } catch {
      setError('Kunne ikke oprette lokale. Prøv igen.')
    }
  }

  return (
    <ModalShell title="Tilføj lokale" onClose={onClose} size="sm">
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label" style={labelStyle}>Navn</label>
          <input
            className="form-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={200}
            placeholder="f.eks. Kældervaskerum"
            autoFocus
          />
        </div>
        <div className="mb-3">
          <label className="form-label" style={labelStyle}>Beskrivelse (valgfri)</label>
          <input
            className="form-control"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={500}
            placeholder="f.eks. Ved parkeringskælderen"
          />
        </div>
        <FormError message={error} />
        <div className="d-flex justify-content-end gap-2 mt-4">
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Annuller</button>
          <button type="submit" className="btn btn-primary fw-semibold" disabled={isLoading || !name.trim()}>
            {isLoading ? 'Opretter…' : 'Opret lokale'}
          </button>
        </div>
      </form>
    </ModalShell>
  )
}

function EditRoomModal({
  propertyId,
  room,
  onClose,
}: {
  propertyId: string
  room: LaundryRoomDto
  onClose: () => void
}) {
  const [name, setName] = useState(room.name)
  const [description, setDescription] = useState(room.description ?? '')
  const [error, setError] = useState<string | null>(null)
  const [updateRoom, { isLoading }] = useUpdateLaundryRoomMutation()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      await updateRoom({ propertyId, roomId: room.id, name: name.trim(), description: description.trim() || null }).unwrap()
      onClose()
    } catch {
      setError('Kunne ikke gemme ændringer. Prøv igen.')
    }
  }

  return (
    <ModalShell title="Rediger lokale" onClose={onClose} size="sm">
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label" style={labelStyle}>Navn</label>
          <input
            className="form-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={200}
            autoFocus
          />
        </div>
        <div className="mb-3">
          <label className="form-label" style={labelStyle}>Beskrivelse (valgfri)</label>
          <input
            className="form-control"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={500}
          />
        </div>
        <FormError message={error} />
        <div className="d-flex justify-content-end gap-2 mt-4">
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Annuller</button>
          <button type="submit" className="btn btn-primary fw-semibold" disabled={isLoading || !name.trim()}>
            {isLoading ? 'Gemmer…' : 'Gem ændringer'}
          </button>
        </div>
      </form>
    </ModalShell>
  )
}

function AddMachineModal({
  roomId,
  roomName,
  onClose,
}: {
  roomId: string
  roomName: string
  onClose: () => void
}) {
  const [name, setName] = useState('')
  const [machineType, setMachineType] = useState<MachineType>(MachineType.Washer)
  const [error, setError] = useState<string | null>(null)
  const [createMachine, { isLoading }] = useCreateMachineMutation()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      await createMachine({ roomId, name: name.trim(), machineType }).unwrap()
      onClose()
    } catch {
      setError('Kunne ikke oprette maskine. Prøv igen.')
    }
  }

  return (
    <ModalShell title={`Tilføj maskine — ${roomName}`} onClose={onClose} size="sm">
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label" style={labelStyle}>Navn</label>
          <input
            className="form-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={100}
            placeholder="f.eks. Vaskemaskine 1"
            autoFocus
          />
        </div>
        <div className="mb-3">
          <label className="form-label" style={labelStyle}>Type</label>
          <select
            className="form-select"
            value={machineType}
            onChange={(e) => setMachineType(Number(e.target.value) as MachineType)}
          >
            {MACHINE_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <FormError message={error} />
        <div className="d-flex justify-content-end gap-2 mt-4">
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Annuller</button>
          <button type="submit" className="btn btn-primary fw-semibold" disabled={isLoading || !name.trim()}>
            {isLoading ? 'Opretter…' : 'Opret maskine'}
          </button>
        </div>
      </form>
    </ModalShell>
  )
}

function EditMachineModal({
  roomId,
  machine,
  onClose,
}: {
  roomId: string
  machine: LaundryMachineDto
  onClose: () => void
}) {
  const [name, setName] = useState(machine.name)
  const [machineType, setMachineType] = useState<MachineType>(machine.machineType)
  const [error, setError] = useState<string | null>(null)
  const [updateMachine, { isLoading }] = useUpdateMachineMutation()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      await updateMachine({ roomId, machineId: machine.id, name: name.trim(), machineType }).unwrap()
      onClose()
    } catch {
      setError('Kunne ikke gemme ændringer. Prøv igen.')
    }
  }

  return (
    <ModalShell title="Rediger maskine" onClose={onClose} size="sm">
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label" style={labelStyle}>Navn</label>
          <input
            className="form-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={100}
            autoFocus
          />
        </div>
        <div className="mb-3">
          <label className="form-label" style={labelStyle}>Type</label>
          <select
            className="form-select"
            value={machineType}
            onChange={(e) => setMachineType(Number(e.target.value) as MachineType)}
          >
            {MACHINE_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <FormError message={error} />
        <div className="d-flex justify-content-end gap-2 mt-4">
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Annuller</button>
          <button type="submit" className="btn btn-primary fw-semibold" disabled={isLoading || !name.trim()}>
            {isLoading ? 'Gemmer…' : 'Gem ændringer'}
          </button>
        </div>
      </form>
    </ModalShell>
  )
}

// ── Style helpers ──────────────────────────────────────────────────────────────

const thStyle: React.CSSProperties = {
  color: colors.textSecondary,
  fontSize: '0.78rem',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
}

const labelStyle: React.CSSProperties = {
  fontSize: '0.85rem',
  fontWeight: 500,
  color: colors.textPrimary,
}
