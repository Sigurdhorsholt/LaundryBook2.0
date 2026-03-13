import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useMeQuery } from '../../../features/auth/authApi'

type MachineType = 'Vaskemaskine' | 'Tørretumbler' | 'Vask/Tør kombination'

interface Machine {
  id: string
  name: string
  type: MachineType
  active: boolean
}

interface Room {
  id: string
  name: string
  description: string
  active: boolean
  machines: Machine[]
}

const machineTypeColor: Record<MachineType, { bg: string; color: string }> = {
  'Vaskemaskine':         { bg: '#e8f0fe', color: '#1565c0' },
  'Tørretumbler':         { bg: '#e8f5e9', color: '#2e7d32' },
  'Vask/Tør kombination': { bg: '#fce4ec', color: '#c62828' },
}

// Placeholder data
const PLACEHOLDER_ROOMS: Room[] = [
  {
    id: '1', name: 'Vaskerum 1 (kælder)', description: 'Adgang via kældertrappen', active: true,
    machines: [
      { id: 'm1', name: 'Maskine A', type: 'Vaskemaskine', active: true },
      { id: 'm2', name: 'Maskine B', type: 'Vaskemaskine', active: true },
      { id: 'm3', name: 'Tørrer 1',  type: 'Tørretumbler', active: true },
    ],
  },
  {
    id: '2', name: 'Vaskerum 2 (stuen)', description: '', active: true,
    machines: [
      { id: 'm4', name: 'Maskine C', type: 'Vask/Tør kombination', active: true },
      { id: 'm5', name: 'Maskine D', type: 'Vask/Tør kombination', active: false },
    ],
  },
]

export function LaundryRoomsPage() {
  const { propertyId } = useParams()
  const { data: user } = useMeQuery()
  const property = user?.memberships.find((m) => m.propertyId === propertyId)
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['1']))

  function toggleRoom(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <div className="p-4 p-lg-5">
      <div className="d-flex align-items-start justify-content-between mb-5 gap-3 flex-wrap">
        <div>
          <p className="mb-1" style={{ fontSize: '0.8rem', color: '#a0adb8', fontWeight: 500 }}>
            {property?.propertyName ?? 'Ejendom'}
          </p>
          <h1 className="fw-bold mb-0" style={{ fontSize: '1.6rem', color: '#0d1b2a' }}>Lokaler & Maskiner</h1>
        </div>
        <button
          className="btn btn-primary btn-sm d-flex align-items-center gap-2"
          style={{ borderRadius: '8px', fontSize: '0.85rem' }}
          disabled
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Tilføj lokale
        </button>
      </div>

      <div className="d-flex flex-column gap-3" style={{ maxWidth: 760 }}>
        {PLACEHOLDER_ROOMS.map((room) => {
          const isOpen = expanded.has(room.id)
          return (
            <div key={room.id} className="bg-white rounded-3" style={{ border: '1px solid #e8ecf0', overflow: 'hidden' }}>

              {/* Room header */}
              <button
                className="w-100 d-flex align-items-center gap-3 px-4 py-3 text-start border-0 bg-transparent"
                style={{ cursor: 'pointer' }}
                onClick={() => toggleRoom(room.id)}
              >
                <div
                  className="rounded-2 d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ width: 36, height: 36, backgroundColor: '#e8f0fe' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1565c0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  </svg>
                </div>
                <div className="flex-grow-1" style={{ minWidth: 0 }}>
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    <span className="fw-semibold" style={{ color: '#0d1b2a', fontSize: '0.95rem' }}>{room.name}</span>
                    {!room.active && (
                      <span className="badge" style={{ backgroundColor: '#f0f4f8', color: '#a0adb8', fontSize: '0.72rem' }}>Inaktiv</span>
                    )}
                    <span style={{ color: '#a0adb8', fontSize: '0.8rem' }}>
                      {room.machines.length} {room.machines.length === 1 ? 'maskine' : 'maskiner'}
                    </span>
                  </div>
                  {room.description && (
                    <p className="mb-0 text-truncate" style={{ fontSize: '0.8rem', color: '#5a6a7a' }}>{room.description}</p>
                  )}
                </div>
                <div className="d-flex align-items-center gap-2 flex-shrink-0">
                  <button className="btn btn-sm" style={{ color: '#5a6a7a', fontSize: '0.8rem', border: '1px solid #e8ecf0' }} onClick={(e) => e.stopPropagation()} disabled>Rediger</button>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a0adb8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}>
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </div>
              </button>

              {/* Machines list */}
              {isOpen && (
                <div className="border-top" style={{ borderColor: '#e8ecf0' }}>
                  <div className="px-4 pt-3 pb-2">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <p className="mb-0 fw-semibold" style={{ fontSize: '0.78rem', color: '#a0adb8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        Maskiner
                      </p>
                      <button className="btn btn-sm" style={{ fontSize: '0.78rem', color: '#1565c0', border: 'none', background: 'none' }} disabled>
                        + Tilføj maskine
                      </button>
                    </div>
                    <div className="d-flex flex-column gap-2 mb-3">
                      {room.machines.map((machine) => {
                        const badge = machineTypeColor[machine.type]
                        return (
                          <div
                            key={machine.id}
                            className="d-flex align-items-center gap-3 px-3 py-2 rounded-2"
                            style={{ backgroundColor: '#f8fafb', border: '1px solid #e8ecf0' }}
                          >
                            <div className="flex-grow-1 d-flex align-items-center gap-2 flex-wrap" style={{ minWidth: 0 }}>
                              <span className="fw-medium" style={{ fontSize: '0.88rem', color: machine.active ? '#0d1b2a' : '#a0adb8' }}>
                                {machine.name}
                              </span>
                              <span className="badge" style={{ backgroundColor: badge.bg, color: badge.color, fontSize: '0.72rem', fontWeight: 500 }}>
                                {machine.type}
                              </span>
                              {!machine.active && (
                                <span className="badge" style={{ backgroundColor: '#f0f4f8', color: '#a0adb8', fontSize: '0.72rem' }}>Inaktiv</span>
                              )}
                            </div>
                            <button className="btn btn-sm flex-shrink-0" style={{ fontSize: '0.78rem', color: '#5a6a7a', border: '1px solid #e8ecf0' }} disabled>Rediger</button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}

            </div>
          )
        })}
      </div>

      <p className="mt-4" style={{ fontSize: '0.78rem', color: '#a0adb8' }}>
        Data indlæses fra API — viser placeholder indhold.
      </p>
    </div>
  )
}
