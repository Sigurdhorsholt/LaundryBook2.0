import { useState, useMemo, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import {
  type LaundryRoomDto,
  type TimeSlotTemplateDto,
  useGetLaundryRoomsQuery,
  useGetTimeSlotsQuery,
  useCreateTimeSlotMutation,
  useDeleteTimeSlotMutation,
} from '../../../features/laundry/laundryApi'
import { ModalShell } from '../../../shared/modals/ModalShell'
import { IconPlus } from '../../../shared/icons'
import { useMeQuery } from '../../../features/auth/authApi'
import { PageHeader, EmptyState, Spinner } from '../../../shared/ui'

// ── Sandbox type ───────────────────────────────────────────────────────────────

interface PendingSlot {
  id: string | null  // null = new, not yet persisted
  startTime: string  // "HH:mm:ss"
  endTime: string    // "HH:mm:ss"
  key: string        // stable React key (id for saved slots, UUID for new ones)
}

// ── Time helpers ───────────────────────────────────────────────────────────────

function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

function toHHmmss(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`
}

function toHHmm(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function formatTime(time: string): string {
  return time.slice(0, 5)
}

function slotToLocal(s: TimeSlotTemplateDto): PendingSlot {
  return { id: s.id, startTime: s.startTime, endTime: s.endTime, key: s.id }
}

// startTime: "HH:mm", durationMinutes, maxEndTime: "HH:mm"
function generateSlots(
  startTime: string,
  durationMinutes: number,
  maxEndTime: string,
): Array<{ startTime: string; endTime: string }> {
  const slots: Array<{ startTime: string; endTime: string }> = []
  let current = toMinutes(startTime)
  const max = toMinutes(maxEndTime)
  while (current + durationMinutes <= max) {
    slots.push({
      startTime: toHHmmss(current),
      endTime: toHHmmss(current + durationMinutes),
    })
    current += durationMinutes
  }
  return slots
}

// ── Constants ──────────────────────────────────────────────────────────────────

const DURATION_OPTIONS = [
  { label: '30m',  minutes: 30  },
  { label: '1t',   minutes: 60  },
  { label: '1t30', minutes: 90  },
  { label: '2t',   minutes: 120 },
  { label: '2t30', minutes: 150 },
  { label: '3t',   minutes: 180 },
]

const TEMPLATES = [
  { label: 'Standard', sublabel: '07–22 · 1t30', from: '07:00', to: '22:00', durationMinutes: 90  },
  { label: 'Kompakt',  sublabel: '07–22 · 1t',   from: '07:00', to: '22:00', durationMinutes: 60  },
  { label: 'Halvdag',  sublabel: '07–13 · 2t',   from: '07:00', to: '13:00', durationMinutes: 120 },
]

const TIMELINE_START = 6 * 60
const TIMELINE_END   = 23 * 60
const TIMELINE_TOTAL = TIMELINE_END - TIMELINE_START
const TIMELINE_TICKS = ['06:00', '12:00', '18:00', '23:00']

// ── Page ───────────────────────────────────────────────────────────────────────

export function PropertyTimeslotsPage() {
  const { propertyId } = useParams<{ propertyId: string }>()
  const { data: user } = useMeQuery()
  const property = user?.memberships?.find((m) => m.propertyId === propertyId)

  const { data: rooms = [], isLoading, isError } = useGetLaundryRoomsQuery(propertyId!, {
    skip: !propertyId,
  })

  const [expandedRoomId, setExpandedRoomId] = useState<string | null>(null)

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
        title="Tidspladser"
        description="Tidspladsskabeloner gentages dagligt og gælder på ubestemt tid."
      />

      {rooms.length === 0 ? (
        <EmptyState
          title="Ingen lokaler endnu"
          description='Opret vaskerum under "Lokaler & Maskiner" først, inden du tilføjer tidspladser.'
        />
      ) : (
        <div className="d-flex flex-column gap-3">
          {rooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              isExpanded={expandedRoomId === room.id}
              onToggleExpand={() => toggleExpand(room.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ── RoomCard ───────────────────────────────────────────────────────────────────
// Owns all sandbox state for one room: pending edits, generator config, save flow.

function RoomCard({
  room,
  isExpanded,
  onToggleExpand,
}: {
  room: LaundryRoomDto
  isExpanded: boolean
  onToggleExpand: () => void
}) {
  const { data: apiSlots = [], isLoading, isFetching } = useGetTimeSlotsQuery(room.id, {
    skip: !isExpanded,
  })

  // Keep a ref so effects can read the latest apiSlots without listing it as a dep
  const apiSlotsRef = useRef<TimeSlotTemplateDto[]>(apiSlots)
  apiSlotsRef.current = apiSlots

  // ── Sandbox ────────────────────────────────────────────────────────────────
  const [pendingSlots, setPendingSlots] = useState<PendingSlot[]>([])
  const [synced, setSynced] = useState(false)
  // afterSave: true while we wait for the post-mutation RTK Query refetch to finish
  const [afterSave, setAfterSave] = useState(false)

  // Sync sandbox from API once per open (not on every background refetch)
  useEffect(() => {
    if (isExpanded && !isLoading && !synced) {
      setPendingSlots(apiSlotsRef.current.map(slotToLocal))
      setSynced(true)
    }
    if (!isExpanded) {
      setSynced(false)
      setAfterSave(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isExpanded, isLoading, synced])
  // ↑ apiSlots excluded intentionally: sandbox syncs once on open, not on every cache update

  // Re-sync once the refetch triggered by cache invalidation completes
  useEffect(() => {
    if (afterSave && !isFetching) {
      setPendingSlots(apiSlotsRef.current.map(slotToLocal))
      setAfterSave(false)
    }
  }, [afterSave, isFetching])

  // ── Generator config ───────────────────────────────────────────────────────
  const [genFrom, setGenFrom] = useState('07:00')
  const [genTo, setGenTo] = useState('22:00')
  const [genDuration, setGenDuration] = useState(90)

  // ── Modal ──────────────────────────────────────────────────────────────────
  const [showAddModal, setShowAddModal] = useState(false)

  // ── Save ───────────────────────────────────────────────────────────────────
  const [createTimeSlot] = useCreateTimeSlotMutation()
  const [deleteTimeSlot] = useDeleteTimeSlotMutation()
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // ── Derived ────────────────────────────────────────────────────────────────
  const isDirty = useMemo(() => {
    if (!synced) return false
    if (pendingSlots.some((s) => s.id === null)) return true
    if (apiSlots.some((a) => !pendingSlots.some((p) => p.id === a.id))) return true
    return false
  }, [pendingSlots, apiSlots, synced])

  // ── Handlers ───────────────────────────────────────────────────────────────

  function handleApplyTemplate(from: string, to: string, duration: number) {
    setGenFrom(from)
    setGenTo(to)
    setGenDuration(duration)
  }

  function handleGenerate() {
    const generated = generateSlots(genFrom, genDuration, genTo).map((s) => ({
      id: null as string | null,
      startTime: s.startTime,
      endTime: s.endTime,
      key: crypto.randomUUID(),
    }))
    setPendingSlots(generated)
  }

  function handleDeletePending(key: string) {
    setPendingSlots((prev) => prev.filter((s) => s.key !== key))
  }

  function handleAddSlot(startTime: string, endTime: string) {
    setPendingSlots((prev) => [
      ...prev,
      { id: null, startTime, endTime, key: crypto.randomUUID() },
    ])
  }

  function handleDiscard() {
    setPendingSlots(apiSlots.map(slotToLocal))
    setSaveError(null)
  }

  async function handleSave() {
    const toDelete = apiSlots.filter((a) => !pendingSlots.some((p) => p.id === a.id))
    const toCreate = pendingSlots.filter((p) => p.id === null)

    setSaving(true)
    setSaveError(null)

    try {
      // TODO: When the Bookings API is implemented, check here whether any toDelete slots
      // have active future bookings. If so, show a conflict warning modal before proceeding.

      for (const slot of toDelete) {
        await deleteTimeSlot({ roomId: room.id, templateId: slot.id }).unwrap()
      }
      for (const slot of toCreate) {
        await createTimeSlot({
          roomId: room.id,
          startTime: slot.startTime,
          endTime: slot.endTime,
        }).unwrap()
      }
      // Signal that we need to re-sync once RTK Query finishes its background refetch
      setAfterSave(true)
    } catch {
      setSaveError('Ikke alle ændringer kunne gemmes. Prøv igen.')
    } finally {
      setSaving(false)
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div
      style={{
        border: '1.5px solid #e8ecf0',
        borderRadius: 12,
        backgroundColor: '#ffffff',
        overflow: 'hidden',
      }}
    >
      {/* Clickable header */}
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
            <div className="fw-semibold" style={{ fontSize: '1rem', color: '#0d1b2a' }}>
              {room.name}
            </div>
            {room.description && (
              <div style={{ fontSize: '0.82rem', color: '#5a6a7a', marginTop: 2 }}>
                {room.description}
              </div>
            )}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#a0adb8', flexShrink: 0, paddingTop: 3 }}>
            {isExpanded ? '▲' : '▼'}
          </span>
        </div>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div style={{ borderTop: '1.5px solid #e8ecf0', backgroundColor: '#f8fafb' }}>
          {isLoading ? (
            <Spinner />
          ) : (
            <>
              {/* Templates — only when no saved slots exist yet */}
              {apiSlots.length === 0 && <TemplateChips onApply={handleApplyTemplate} />}

              {/* Timeline: live preview of pending state */}
              <DayTimeline pendingSlots={pendingSlots} />

              {/* Generator: replaces pending state, no direct API calls */}
              <SlotGenerator
                from={genFrom}
                to={genTo}
                durationMinutes={genDuration}
                onFromChange={setGenFrom}
                onToChange={setGenTo}
                onDurationChange={setGenDuration}
                onGenerate={handleGenerate}
              />

              {/* Pending slot list */}
              {pendingSlots.length > 0 ? (
                <PendingSlotList slots={pendingSlots} onDelete={handleDeletePending} />
              ) : (
                <div className="px-4 py-2" style={{ fontSize: '0.85rem', color: '#a0adb8' }}>
                  Ingen tidspladser — brug generatoren ovenfor eller tilføj manuelt.
                </div>
              )}

              {/* Manual single-slot add */}
              <div className="px-4 pb-3 pt-2">
                <button
                  className="btn btn-sm d-flex align-items-center gap-1"
                  style={{ fontSize: '0.82rem', color: '#1565c0', fontWeight: 500 }}
                  onClick={() => setShowAddModal(true)}
                >
                  <IconPlus size={13} color="#1565c0" />
                  Tilføj enkelt tidsplads
                </button>
              </div>

              {/* Save bar — shown when there are pending changes or a save error */}
              {(isDirty || saveError != null) && (
                <SaveBar
                  isDirty={isDirty}
                  saving={saving}
                  saveError={saveError}
                  onSave={handleSave}
                  onDiscard={handleDiscard}
                />
              )}
            </>
          )}
        </div>
      )}

      {showAddModal && (
        <AddSlotModal
          roomName={room.name}
          onAdd={handleAddSlot}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  )
}

// ── TemplateChips ──────────────────────────────────────────────────────────────

function TemplateChips({
  onApply,
}: {
  onApply: (from: string, to: string, durationMinutes: number) => void
}) {
  return (
    <div className="px-4 pt-3 pb-2">
      <div
        style={{
          fontSize: '0.72rem',
          color: '#a0adb8',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: 8,
        }}
      >
        Hurtigskabeloner
      </div>
      <div className="d-flex flex-wrap gap-2">
        {TEMPLATES.map((t) => (
          <button
            key={t.label}
            onClick={() => onApply(t.from, t.to, t.durationMinutes)}
            style={{
              padding: '6px 14px',
              borderRadius: 20,
              border: '1.5px solid #d0d9e2',
              background: '#ffffff',
              fontSize: '0.82rem',
              color: '#0d1b2a',
              cursor: 'pointer',
              fontWeight: 500,
              lineHeight: 1.4,
            }}
          >
            {t.label}
            <span style={{ color: '#a0adb8', marginLeft: 6, fontSize: '0.75rem' }}>
              {t.sublabel}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ── DayTimeline ────────────────────────────────────────────────────────────────

function DayTimeline({ pendingSlots }: { pendingSlots: PendingSlot[] }) {
  return (
    <div className="px-4 pt-2 pb-3">
      <div
        style={{
          position: 'relative',
          height: 20,
          backgroundColor: '#e8ecf0',
          borderRadius: 6,
          overflow: 'hidden',
        }}
      >
        {pendingSlots.map((slot) => {
          const start = Math.max(toMinutes(slot.startTime), TIMELINE_START)
          const end   = Math.min(toMinutes(slot.endTime),   TIMELINE_END)
          if (start >= end) return null
          const left  = ((start - TIMELINE_START) / TIMELINE_TOTAL) * 100
          const width = ((end   - start)           / TIMELINE_TOTAL) * 100
          // Unsaved slots (id=null) render slightly lighter so the admin sees they're pending
          const color = slot.id !== null ? '#1565c0' : '#64b5f6'
          return (
            <div
              key={slot.key}
              title={`${formatTime(slot.startTime)} – ${formatTime(slot.endTime)}`}
              style={{
                position: 'absolute',
                left:   `${left}%`,
                width:  `${width}%`,
                top: 0,
                bottom: 0,
                backgroundColor: color,
                opacity: 0.85,
              }}
            />
          )
        })}
      </div>

      <div style={{ position: 'relative', height: 18, marginTop: 4 }}>
        {TIMELINE_TICKS.map((tick) => {
          const pct = ((toMinutes(tick) - TIMELINE_START) / TIMELINE_TOTAL) * 100
          return (
            <span
              key={tick}
              style={{
                position: 'absolute',
                left: `${pct}%`,
                transform: 'translateX(-50%)',
                fontSize: '0.68rem',
                color: '#a0adb8',
                whiteSpace: 'nowrap',
                userSelect: 'none',
              }}
            >
              {tick}
            </span>
          )
        })}
      </div>
    </div>
  )
}

// ── SlotGenerator ──────────────────────────────────────────────────────────────
// Calculates a new schedule locally and hands it to the parent via onGenerate.
// No API calls here — just modifies the sandbox.

function SlotGenerator({
  from,
  to,
  durationMinutes,
  onFromChange,
  onToChange,
  onDurationChange,
  onGenerate,
}: {
  from: string
  to: string
  durationMinutes: number
  onFromChange: (v: string) => void
  onToChange: (v: string) => void
  onDurationChange: (v: number) => void
  onGenerate: () => void
}) {
  const isValidWindow = toMinutes(from) < toMinutes(to)

  const previewCount = useMemo(() => {
    if (!isValidWindow) return 0
    return generateSlots(from, durationMinutes, to).length
  }, [from, to, durationMinutes, isValidWindow])

  const previewLabel = isValidWindow
    ? `${previewCount} tidsplads${previewCount !== 1 ? 'er' : ''} · erstatter nuværende`
    : 'Ugyldig tidsramme'

  return (
    <div
      style={{
        margin: '0 16px 12px',
        border: '1.5px solid #e8ecf0',
        borderRadius: 10,
        backgroundColor: '#ffffff',
        padding: '14px 16px',
      }}
    >
      <div style={sectionLabelStyle}>Generer tidsplan</div>

      <div className="d-flex flex-wrap align-items-end gap-3 mb-3">
        <div>
          <div style={genLabelStyle}>Fra</div>
          <HalfHourPicker value={from} onChange={onFromChange} />
        </div>
        <div>
          <div style={genLabelStyle}>Til</div>
          <HalfHourPicker value={to} onChange={onToChange} />
        </div>
      </div>

      <div className="mb-3">
        <div style={genLabelStyle}>Varighed per plads</div>
        <div className="d-flex flex-wrap gap-2 mt-1">
          {DURATION_OPTIONS.map((opt) => {
            const selected = durationMinutes === opt.minutes
            return (
              <button
                key={opt.minutes}
                onClick={() => onDurationChange(opt.minutes)}
                style={chipStyle(selected)}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="d-flex align-items-center justify-content-between gap-3 flex-wrap">
        <span style={{ fontSize: '0.82rem', color: '#5a6a7a' }}>
          {previewLabel}
        </span>
        <button
          className="btn btn-outline-primary btn-sm fw-semibold"
          style={{ borderRadius: 8, fontSize: '0.82rem' }}
          disabled={previewCount === 0 || !isValidWindow}
          onClick={onGenerate}
        >
          Generer
        </button>
      </div>
    </div>
  )
}

// ── PendingSlotList ────────────────────────────────────────────────────────────

function PendingSlotList({
  slots,
  onDelete,
}: {
  slots: PendingSlot[]
  onDelete: (key: string) => void
}) {
  const sorted = [...slots].sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime))
  return (
    <div className="table-responsive">
      <table className="table table-hover mb-0" style={{ fontSize: '0.85rem' }}>
        <thead>
          <tr style={{ backgroundColor: '#edf0f4' }}>
            <th className="px-4 py-2" style={thStyle}>Tidsrum</th>
            <th className="px-4 py-2" style={{ ...thStyle, width: 1, whiteSpace: 'nowrap' }}></th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((slot) => (
            <PendingSlotRow
              key={slot.key}
              slot={slot}
              onDelete={() => onDelete(slot.key)}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── PendingSlotRow ─────────────────────────────────────────────────────────────

function PendingSlotRow({
  slot,
  onDelete,
}: {
  slot: PendingSlot
  onDelete: () => void
}) {
  const isNew = slot.id === null
  return (
    <tr>
      <td className="px-4 py-2 align-middle">
        <span style={{ fontWeight: 500, color: '#0d1b2a' }}>
          {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
        </span>
        {isNew && (
          <span
            style={{
              marginLeft: 8,
              fontSize: '0.72rem',
              fontWeight: 600,
              color: '#1565c0',
              backgroundColor: '#e3f0ff',
              padding: '2px 7px',
              borderRadius: 10,
            }}
          >
            Ny
          </span>
        )}
      </td>
      <td className="px-4 py-2 align-middle" style={{ textAlign: 'right' }}>
        <button
          className="btn btn-sm"
          style={{ fontSize: '0.78rem', color: '#a0adb8', lineHeight: 1 }}
          onClick={onDelete}
          aria-label="Fjern"
          title="Fjern fra listen"
        >
          ✕
        </button>
      </td>
    </tr>
  )
}

// ── SaveBar ────────────────────────────────────────────────────────────────────

function SaveBar({
  isDirty,
  saving,
  saveError,
  onSave,
  onDiscard,
}: {
  isDirty: boolean
  saving: boolean
  saveError: string | null
  onSave: () => void
  onDiscard: () => void
}) {
  return (
    <div
      style={{
        borderTop: '1.5px solid #c7d9f5',
        padding: '12px 20px',
        backgroundColor: '#f0f5ff',
      }}
    >
      <div className="d-flex align-items-center justify-content-between gap-3 flex-wrap">
        <span style={{ fontSize: '0.82rem' }}>
          {saveError != null ? (
            <span style={{ color: '#dc3545' }}>{saveError}</span>
          ) : (
            <span style={{ color: '#1565c0', fontWeight: 500 }}>Ugemte ændringer</span>
          )}
        </span>
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-secondary btn-sm"
            disabled={saving}
            onClick={onDiscard}
            style={{ fontSize: '0.82rem' }}
          >
            Kassér
          </button>
          <button
            className="btn btn-primary btn-sm fw-semibold"
            disabled={saving || !isDirty}
            onClick={onSave}
            style={{ fontSize: '0.82rem', borderRadius: 8 }}
          >
            {saving ? 'Gemmer…' : 'Gem ændringer'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── AddSlotModal ───────────────────────────────────────────────────────────────
// No API calls — appends to the sandbox via onAdd callback.

function AddSlotModal({
  roomName,
  onAdd,
  onClose,
}: {
  roomName: string
  onAdd: (startTime: string, endTime: string) => void
  onClose: () => void
}) {
  const [startTime, setStartTime] = useState('08:00')
  const [durationMinutes, setDurationMinutes] = useState(90)

  const endMinutes = toMinutes(startTime) + durationMinutes
  const endTimeDisplay = endMinutes < 24 * 60 ? toHHmm(endMinutes) : null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (endTimeDisplay == null) return
    onAdd(startTime + ':00', toHHmmss(endMinutes))
    onClose()
  }

  return (
    <ModalShell title={`Tilføj tidsplads — ${roomName}`} onClose={onClose} size="sm">
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label" style={labelStyle}>Starttidspunkt</label>
          <div><HalfHourPicker value={startTime} onChange={setStartTime} /></div>
        </div>

        <div className="mb-3">
          <label className="form-label" style={labelStyle}>Varighed</label>
          <div className="d-flex flex-wrap gap-2 mt-1">
            {DURATION_OPTIONS.map((opt) => {
              const selected = durationMinutes === opt.minutes
              return (
                <button
                  key={opt.minutes}
                  type="button"
                  onClick={() => setDurationMinutes(opt.minutes)}
                  style={chipStyle(selected)}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="mb-3">
          <span style={{ fontSize: '0.85rem', color: '#5a6a7a' }}>
            Slutter:{' '}
            {endTimeDisplay != null ? (
              <strong style={{ color: '#0d1b2a' }}>{endTimeDisplay}</strong>
            ) : (
              <span style={{ color: '#dc3545' }}>Overskrider midnat</span>
            )}
          </span>
        </div>

        <div className="d-flex justify-content-end gap-2 mt-4">
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
            Annuller
          </button>
          <button
            type="submit"
            className="btn btn-primary fw-semibold"
            disabled={endTimeDisplay == null}
          >
            Tilføj
          </button>
        </div>
      </form>
    </ModalShell>
  )
}

// ── HalfHourPicker ─────────────────────────────────────────────────────────────

function HalfHourPicker({
  value,
  onChange,
}: {
  value: string   // "HH:mm"
  onChange: (v: string) => void
}) {
  const parts  = value.split(':')
  const hour   = parseInt(parts[0] ?? '0', 10)
  const minute = parseInt(parts[1] ?? '0', 10)

  const selectStyle: React.CSSProperties = {
    border: 'none',
    background: 'transparent',
    fontSize: '0.9rem',
    fontWeight: 500,
    color: '#0d1b2a',
    padding: '0 2px',
    cursor: 'pointer',
    outline: 'none',
    appearance: 'none' as const,
  }

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        border: '1.5px solid #ced4da',
        borderRadius: 8,
        backgroundColor: '#ffffff',
        padding: '5px 8px',
        gap: 2,
      }}
    >
      <select
        value={hour}
        onChange={(e) => onChange(toHHmm(Number(e.target.value) * 60 + minute))}
        style={selectStyle}
        aria-label="Time"
      >
        {Array.from({ length: 24 }, (_, i) => (
          <option key={i} value={i}>{String(i).padStart(2, '0')}</option>
        ))}
      </select>
      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#5a6a7a' }}>:</span>
      <select
        value={minute}
        onChange={(e) => onChange(toHHmm(hour * 60 + Number(e.target.value)))}
        style={selectStyle}
        aria-label="Minute"
      >
        <option value={0}>00</option>
        <option value={30}>30</option>
      </select>
    </div>
  )
}

// ── Style helpers ──────────────────────────────────────────────────────────────

function chipStyle(selected: boolean): React.CSSProperties {
  return {
    padding: '5px 12px',
    borderRadius: 20,
    border: `1.5px solid ${selected ? '#1565c0' : '#d0d9e2'}`,
    backgroundColor: selected ? '#f0f5ff' : '#ffffff',
    color: selected ? '#1565c0' : '#5a6a7a',
    fontSize: '0.82rem',
    fontWeight: selected ? 600 : 400,
    cursor: 'pointer',
  }
}

const thStyle: React.CSSProperties = {
  color: '#5a6a7a',
  fontSize: '0.78rem',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
}

const labelStyle: React.CSSProperties = {
  fontSize: '0.85rem',
  fontWeight: 500,
  color: '#0d1b2a',
}

const sectionLabelStyle: React.CSSProperties = {
  fontSize: '0.72rem',
  fontWeight: 600,
  color: '#5a6a7a',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  marginBottom: 12,
}

const genLabelStyle: React.CSSProperties = {
  fontSize: '0.78rem',
  fontWeight: 500,
  color: '#5a6a7a',
  marginBottom: 4,
}
