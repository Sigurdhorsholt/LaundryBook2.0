import { useNavigate } from 'react-router-dom'

export function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div
      className="d-flex flex-column align-items-center justify-content-center text-center"
      style={{ minHeight: '60vh', padding: '2rem' }}
    >
      <p
        className="fw-bold mb-2"
        style={{ fontSize: '4rem', color: '#e8ecf0', lineHeight: 1 }}
      >
        404
      </p>
      <h1
        className="fw-bold mb-3"
        style={{ fontSize: '1.5rem', color: '#0d1b2a' }}
      >
        Siden blev ikke fundet
      </h1>
      <p className="mb-4" style={{ color: '#5a6a7a', maxWidth: 360 }}>
        Den side du leder efter eksisterer ikke eller er blevet flyttet.
      </p>
      <button
        className="btn btn-primary px-4"
        style={{ borderRadius: '8px' }}
        onClick={() => navigate('/')}
      >
        Gå til forsiden
      </button>
    </div>
  )
}
