const BrandLogo = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1565c0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="4" />
    <path d="M2 12h3M19 12h3M12 2v3M12 19v3" />
  </svg>
)

interface PublicNavbarProps {
  onLoginClick: () => void
}

export function PublicNavbar({ onLoginClick }: PublicNavbarProps) {
  return (
    <nav
      className="sticky-top border-bottom"
      style={{ backgroundColor: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(10px)', zIndex: 1030 }}
    >
      <div className="container-xl px-4 d-flex align-items-center justify-content-between" style={{ height: 56 }}>
        <a
          className="d-flex align-items-center gap-2 fw-bold text-decoration-none"
          href="/"
          style={{ color: '#0d1b2a', fontSize: '1.15rem', letterSpacing: '-0.2px' }}
        >
          <BrandLogo />
          LaundryBook
        </a>
        <button
          className="btn btn-primary fw-semibold px-4"
          style={{ borderRadius: '8px', fontSize: '0.9rem' }}
          onClick={onLoginClick}
        >
          Log ind
        </button>
      </div>
    </nav>
  )
}
