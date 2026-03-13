export function LaundryPage() {
  return (
    <div className="container-xl px-4 py-5">
      <h1 className="fw-bold mb-2" style={{ fontSize: '1.75rem', color: '#0d1b2a' }}>
        Vaskebooking
      </h1>
      <p className="text-secondary mb-5">Book et ledigt vasketid i dit vaskerum.</p>

      {/* Placeholder */}
      <div
        className="rounded-3 d-flex flex-column align-items-center justify-content-center text-center p-5"
        style={{ border: '2px dashed #e8ecf0', minHeight: 320 }}
      >
        <div
          className="rounded-circle d-flex align-items-center justify-content-center mb-4"
          style={{ width: 64, height: 64, backgroundColor: '#e8f0fe' }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1565c0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </div>
        <p className="fw-semibold mb-1" style={{ color: '#0d1b2a' }}>Bookingkalender</p>
        <p style={{ color: '#5a6a7a', fontSize: '0.9rem', maxWidth: 300 }}>
          Her vil du snart kunne se ledige tider og booke vaskerum.
        </p>
      </div>
    </div>
  )
}
