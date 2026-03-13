import { useParams } from 'react-router-dom'
import { useMeQuery } from '../../../features/auth/authApi'

export function PropertySettingsPage() {
  const { propertyId } = useParams()
  const { data: user } = useMeQuery()
  const property = user?.memberships.find((m) => m.propertyId === propertyId)

  return (
    <div className="p-4 p-lg-5">
      <div className="mb-5">
        <p className="mb-1" style={{ fontSize: '0.8rem', color: '#a0adb8', fontWeight: 500 }}>
          {property?.propertyName ?? 'Ejendom'}
        </p>
        <h1 className="fw-bold mb-0" style={{ fontSize: '1.6rem', color: '#0d1b2a' }}>Indstillinger</h1>
      </div>

      <div className="row g-4" style={{ maxWidth: 800 }}>

        {/* Booking mode */}
        <div className="col-12">
          <div className="bg-white rounded-3 p-4" style={{ border: '1px solid #e8ecf0' }}>
            <h2 className="fw-semibold mb-1" style={{ fontSize: '1rem', color: '#0d1b2a' }}>Bookingtype</h2>
            <p className="mb-4" style={{ fontSize: '0.85rem', color: '#5a6a7a' }}>
              Vælg om beboere booker hele vaskerummet eller en specifik maskine.
            </p>
            <div className="d-flex flex-column flex-sm-row gap-3">
              {[
                { id: 'room', label: 'Helt vaskerum', desc: 'Beboeren booker adgang til hele vaskerummet for en periode.' },
                { id: 'machine', label: 'Specifik maskine', desc: 'Beboeren vælger en bestemt maskine i vaskerummet.' },
              ].map((opt, i) => (
                <label
                  key={opt.id}
                  className="d-flex align-items-start gap-3 p-3 rounded-2 flex-grow-1"
                  style={{ border: `1.5px solid ${i === 0 ? '#1565c0' : '#e8ecf0'}`, cursor: 'pointer', backgroundColor: i === 0 ? '#f0f6ff' : '#fff' }}
                >
                  <input type="radio" name="bookingMode" defaultChecked={i === 0} className="mt-1 flex-shrink-0" />
                  <div>
                    <p className="fw-semibold mb-1" style={{ fontSize: '0.88rem', color: '#0d1b2a' }}>{opt.label}</p>
                    <p className="mb-0" style={{ fontSize: '0.8rem', color: '#5a6a7a' }}>{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Numeric settings */}
        <div className="col-12 col-md-6">
          <div className="bg-white rounded-3 p-4 h-100" style={{ border: '1px solid #e8ecf0' }}>
            <h2 className="fw-semibold mb-1" style={{ fontSize: '1rem', color: '#0d1b2a' }}>Afbestillingsvindue</h2>
            <p className="mb-3" style={{ fontSize: '0.85rem', color: '#5a6a7a' }}>
              Minimum antal minutter inden en booking kan afbestilles.
            </p>
            <div className="input-group">
              <input type="number" className="form-control" defaultValue={60} min={0} disabled style={{ maxWidth: 100 }} />
              <span className="input-group-text" style={{ fontSize: '0.85rem', color: '#5a6a7a' }}>minutter</span>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6">
          <div className="bg-white rounded-3 p-4 h-100" style={{ border: '1px solid #e8ecf0' }}>
            <h2 className="fw-semibold mb-1" style={{ fontSize: '1rem', color: '#0d1b2a' }}>Maks. samtidige bookinger</h2>
            <p className="mb-3" style={{ fontSize: '0.85rem', color: '#5a6a7a' }}>
              Antal aktive bookinger en beboer kan have ad gangen.
            </p>
            <div className="input-group">
              <input type="number" className="form-control" defaultValue={2} min={1} disabled style={{ maxWidth: 100 }} />
              <span className="input-group-text" style={{ fontSize: '0.85rem', color: '#5a6a7a' }}>bookinger</span>
            </div>
          </div>
        </div>

        {/* Save */}
        <div className="col-12">
          <button className="btn btn-primary" style={{ borderRadius: '8px' }} disabled>
            Gem indstillinger
          </button>
          <p className="mt-2 mb-0" style={{ fontSize: '0.78rem', color: '#a0adb8' }}>
            Redigering aktiveres når API er klar.
          </p>
        </div>

      </div>
    </div>
  )
}
