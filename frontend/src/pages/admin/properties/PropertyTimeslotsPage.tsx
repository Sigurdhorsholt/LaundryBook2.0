import { useParams } from 'react-router-dom'
import { useMeQuery } from '../../../features/auth/authApi'

interface TimeSlot { id: string; start: string; end: string; active: boolean }
interface RoomSlots { roomId: string; roomName: string; slots: TimeSlot[] }

const PLACEHOLDER: RoomSlots[] = [
  {
    roomId: '1', roomName: 'Vaskerum 1 (kælder)',
    slots: [
      { id: 's1', start: '07:00', end: '09:00', active: true },
      { id: 's2', start: '09:00', end: '11:00', active: true },
      { id: 's3', start: '11:00', end: '13:00', active: true },
      { id: 's4', start: '13:00', end: '15:00', active: true },
      { id: 's5', start: '15:00', end: '17:00', active: true },
      { id: 's6', start: '17:00', end: '19:00', active: true },
      { id: 's7', start: '19:00', end: '21:00', active: false },
    ],
  },
  {
    roomId: '2', roomName: 'Vaskerum 2 (stuen)',
    slots: [
      { id: 's8', start: '08:00', end: '11:00', active: true },
      { id: 's9', start: '11:00', end: '14:00', active: true },
      { id: 's10', start: '14:00', end: '17:00', active: true },
      { id: 's11', start: '17:00', end: '20:00', active: true },
    ],
  },
]

export function PropertyTimeslotsPage() {
  const { propertyId } = useParams()
  const { data: user } = useMeQuery()
  const property = user?.memberships.find((m) => m.propertyId === propertyId)

  return (
    <div className="p-4 p-lg-5">
      <div className="d-flex align-items-start justify-content-between mb-5 gap-3 flex-wrap">
        <div>
          <p className="mb-1" style={{ fontSize: '0.8rem', color: '#a0adb8', fontWeight: 500 }}>
            {property?.propertyName ?? 'Ejendom'}
          </p>
          <h1 className="fw-bold mb-0" style={{ fontSize: '1.6rem', color: '#0d1b2a' }}>Tidspladser</h1>
          <p className="mt-1 mb-0" style={{ fontSize: '0.85rem', color: '#5a6a7a' }}>
            Tidspladsskabeloner gentages dagligt og gælder på ubestemt tid.
          </p>
        </div>
        <button
          className="btn btn-primary btn-sm d-flex align-items-center gap-2"
          style={{ borderRadius: '8px', fontSize: '0.85rem' }}
          disabled
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Tilføj tidsplads
        </button>
      </div>

      <div className="d-flex flex-column gap-4" style={{ maxWidth: 680 }}>
        {PLACEHOLDER.map((room) => (
          <div key={room.roomId}>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <h2 className="fw-semibold mb-0" style={{ fontSize: '0.9rem', color: '#0d1b2a' }}>
                {room.roomName}
              </h2>
              <button className="btn btn-sm" style={{ fontSize: '0.78rem', color: '#1565c0', border: 'none', background: 'none' }} disabled>
                + Tilføj
              </button>
            </div>
            <div className="bg-white rounded-3" style={{ border: '1px solid #e8ecf0', overflow: 'hidden' }}>
              {room.slots.map((slot, idx) => (
                <div
                  key={slot.id}
                  className="d-flex align-items-center gap-3 px-4 py-3"
                  style={{
                    borderTop: idx > 0 ? '1px solid #f0f4f8' : 'none',
                    opacity: slot.active ? 1 : 0.5,
                  }}
                >
                  <div
                    className="rounded-2 d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{ width: 32, height: 32, backgroundColor: '#e8f0fe' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1565c0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                  </div>
                  <div className="flex-grow-1">
                    <span className="fw-semibold" style={{ fontSize: '0.9rem', color: '#0d1b2a' }}>
                      {slot.start} – {slot.end}
                    </span>
                    {!slot.active && (
                      <span className="ms-2 badge" style={{ backgroundColor: '#f0f4f8', color: '#a0adb8', fontSize: '0.7rem' }}>Inaktiv</span>
                    )}
                  </div>
                  <div className="d-flex gap-2 flex-shrink-0">
                    <button className="btn btn-sm" style={{ fontSize: '0.78rem', color: '#5a6a7a', border: '1px solid #e8ecf0' }} disabled>Rediger</button>
                    <button className="btn btn-sm" style={{ fontSize: '0.78rem', color: '#dc3545', border: '1px solid #f8d7da' }} disabled>Slet</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="mt-4" style={{ fontSize: '0.78rem', color: '#a0adb8' }}>
        Data indlæses fra API — viser placeholder indhold.
      </p>
    </div>
  )
}
