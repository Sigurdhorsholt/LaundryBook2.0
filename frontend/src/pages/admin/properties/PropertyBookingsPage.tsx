import { useParams } from 'react-router-dom'
import { useMeQuery } from '../../../features/auth/authApi'

type BookingStatus = 'Aktiv' | 'Annulleret'

interface Booking {
  id: string
  user: string
  apartment: string
  room: string
  date: string
  slot: string
  status: BookingStatus
}

const statusStyle: Record<BookingStatus, { bg: string; color: string }> = {
  Aktiv:      { bg: '#e8f5e9', color: '#2e7d32' },
  Annulleret: { bg: '#f0f4f8', color: '#a0adb8' },
}

const PLACEHOLDER_BOOKINGS: Booking[] = [
  { id: '1', user: 'Anna Larsen',   apartment: '1A', room: 'Vaskerum 1', date: '2026-03-13', slot: '09:00–11:00', status: 'Aktiv' },
  { id: '2', user: 'Mads Nielsen',  apartment: '1B', room: 'Vaskerum 2', date: '2026-03-13', slot: '14:00–17:00', status: 'Aktiv' },
  { id: '3', user: 'Sofie Jensen',  apartment: '2A', room: 'Vaskerum 1', date: '2026-03-14', slot: '07:00–09:00', status: 'Aktiv' },
  { id: '4', user: 'Karl Andersen', apartment: '2B', room: 'Vaskerum 1', date: '2026-03-12', slot: '17:00–19:00', status: 'Annulleret' },
  { id: '5', user: 'Lotte Thomsen', apartment: '3A', room: 'Vaskerum 2', date: '2026-03-15', slot: '11:00–14:00', status: 'Aktiv' },
]

export function PropertyBookingsPage() {
  const { propertyId } = useParams()
  const { data: user } = useMeQuery()
  const property = user?.memberships.find((m) => m.propertyId === propertyId)

  const active = PLACEHOLDER_BOOKINGS.filter((b) => b.status === 'Aktiv').length

  return (
    <div className="p-4 p-lg-5">
      <div className="d-flex align-items-start justify-content-between mb-5 gap-3 flex-wrap">
        <div>
          <p className="mb-1" style={{ fontSize: '0.8rem', color: '#a0adb8', fontWeight: 500 }}>
            {property?.propertyName ?? 'Ejendom'}
          </p>
          <h1 className="fw-bold mb-0" style={{ fontSize: '1.6rem', color: '#0d1b2a' }}>Bookinger</h1>
        </div>
        {/* Filter row */}
        <div className="d-flex gap-2 flex-wrap">
          <select className="form-select form-select-sm" style={{ width: 'auto', fontSize: '0.85rem' }} disabled>
            <option>Alle vaskerum</option>
          </select>
          <input type="date" className="form-control form-control-sm" style={{ width: 'auto', fontSize: '0.85rem' }} disabled />
        </div>
      </div>

      {/* Summary */}
      <div className="row g-3 mb-5">
        {[
          { label: 'Aktive bookinger', value: active, color: '#1565c0' },
          { label: 'I dag', value: PLACEHOLDER_BOOKINGS.filter(b => b.date === '2026-03-13').length, color: '#2e7d32' },
          { label: 'Annullerede', value: PLACEHOLDER_BOOKINGS.filter(b => b.status === 'Annulleret').length, color: '#a0adb8' },
        ].map((s) => (
          <div key={s.label} className="col-6 col-md-4">
            <div className="bg-white rounded-3 p-3" style={{ border: '1px solid #e8ecf0' }}>
              <p className="mb-1" style={{ fontSize: '0.78rem', color: '#5a6a7a', fontWeight: 500 }}>{s.label}</p>
              <p className="fw-bold mb-0" style={{ fontSize: '1.75rem', color: s.color, lineHeight: 1 }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-3" style={{ border: '1px solid #e8ecf0', overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="table table-hover mb-0" style={{ fontSize: '0.875rem' }}>
            <thead style={{ backgroundColor: '#f8fafb' }}>
              <tr>
                <th className="border-0 px-4 py-3 fw-semibold" style={{ color: '#5a6a7a', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Beboer</th>
                <th className="border-0 px-4 py-3 fw-semibold d-none d-sm-table-cell" style={{ color: '#5a6a7a', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Vaskerum</th>
                <th className="border-0 px-4 py-3 fw-semibold" style={{ color: '#5a6a7a', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Dato</th>
                <th className="border-0 px-4 py-3 fw-semibold d-none d-md-table-cell" style={{ color: '#5a6a7a', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tidsplads</th>
                <th className="border-0 px-4 py-3 fw-semibold" style={{ color: '#5a6a7a', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                <th className="border-0 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {PLACEHOLDER_BOOKINGS.map((b) => {
                const s = statusStyle[b.status]
                return (
                  <tr key={b.id} style={{ opacity: b.status === 'Annulleret' ? 0.6 : 1 }}>
                    <td className="px-4 py-3 align-middle">
                      <p className="fw-medium mb-0" style={{ color: '#0d1b2a', fontSize: '0.875rem' }}>{b.user}</p>
                      <p className="mb-0" style={{ color: '#a0adb8', fontSize: '0.75rem' }}>Lejl. {b.apartment}</p>
                    </td>
                    <td className="px-4 py-3 align-middle d-none d-sm-table-cell" style={{ color: '#5a6a7a' }}>{b.room}</td>
                    <td className="px-4 py-3 align-middle" style={{ color: '#0d1b2a', whiteSpace: 'nowrap' }}>{b.date}</td>
                    <td className="px-4 py-3 align-middle d-none d-md-table-cell" style={{ color: '#5a6a7a' }}>{b.slot}</td>
                    <td className="px-4 py-3 align-middle">
                      <span className="badge" style={{ backgroundColor: s.bg, color: s.color, fontWeight: 500, fontSize: '0.75rem' }}>{b.status}</span>
                    </td>
                    <td className="px-4 py-3 align-middle text-end">
                      <button className="btn btn-sm" style={{ fontSize: '0.78rem', color: '#dc3545', border: '1px solid #f8d7da' }} disabled>Annuller</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <p className="mt-3" style={{ fontSize: '0.78rem', color: '#a0adb8' }}>
        Data indlæses fra API — viser placeholder indhold.
      </p>
    </div>
  )
}
