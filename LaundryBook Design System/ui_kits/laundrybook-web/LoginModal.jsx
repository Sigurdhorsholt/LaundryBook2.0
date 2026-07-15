function LoginModal({ onClose, onSuccess, go }) {
  const [email,    setEmail]    = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error,    setError]    = React.useState(null);

  const [showForgot,  setShowForgot]  = React.useState(false);
  const [forgotEmail, setForgotEmail] = React.useState('');
  const [forgotSent,  setForgotSent]  = React.useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) return;
    if (onSuccess) onSuccess(email);
  };

  function backToLogin() {
    setShowForgot(false);
    setForgotSent(false);
    setForgotEmail('');
  }

  return (
    <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{ backgroundColor: 'rgba(10,25,41,0.55)', zIndex: 2000, padding: 16 }}
      onClick={onClose}>

      {/* Card */}
      <div style={{
        width: '100%', maxWidth: 440,
        backgroundColor: C.bgCard,
        borderRadius: 16,
        boxShadow: '0 20px 60px rgba(10,25,41,0.18)',
        overflow: 'hidden',
      }}
        onClick={(e) => e.stopPropagation()}>

        {/* Brand header */}
        <div style={{
          backgroundColor: C.primaryLighter,
          borderBottom: `1px solid ${C.primaryBorder}`,
          padding: '18px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <BrandLogo size={19} />
            <span style={{ fontWeight: 700, color: C.textPrimary, fontSize: '1rem', letterSpacing: '-0.2px' }}>
              LaundryBook
            </span>
          </div>
          <button className="btn-close" onClick={onClose} style={{ fontSize: '0.8rem' }} />
        </div>

        {/* Body */}
        <div style={{ padding: '28px 24px 24px' }}>
          {showForgot ? (
            /* ── Forgot password ── */
            <>
              <h5 style={{ fontWeight: 700, color: C.textPrimary, marginBottom: 4, fontSize: '1.2rem' }}>
                Glemt adgangskode
              </h5>
              {forgotSent ? (
                <>
                  <p style={{ fontSize: '0.88rem', color: C.textSecondary, marginBottom: 20, lineHeight: 1.6 }}>
                    Hvis din e-mail er registreret, modtager du snart et link til at nulstille din adgangskode.
                  </p>
                  <button className="btn fw-semibold" type="button"
                    style={{ backgroundColor: C.primaryLight, color: C.primary, border: `1px solid ${C.primaryBorder}`, borderRadius: 8, padding: '10px 20px' }}
                    onClick={backToLogin}>
                    ← Tilbage til login
                  </button>
                </>
              ) : (
                <>
                  <p style={{ fontSize: '0.88rem', color: C.textSecondary, marginBottom: 20 }}>
                    Indtast din email, så sender vi dig et nulstillingslink.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <input className="form-control" type="email" placeholder="Email" autoFocus
                      value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} />
                    <button className="btn fw-semibold" type="button"
                      style={{ backgroundColor: C.primary, color: '#fff', border: 'none', borderRadius: 8, padding: '10px' }}
                      onClick={() => setForgotSent(true)}>
                      Send nulstillingslink
                    </button>
                  </div>
                  <button className="btn btn-link p-0 mt-3" type="button"
                    style={{ color: C.textSecondary, fontSize: '0.84rem', textDecoration: 'none' }}
                    onClick={backToLogin}>
                    ← Tilbage til login
                  </button>
                </>
              )}
            </>
          ) : (
            /* ── Login ── */
            <>
              <h5 style={{ fontWeight: 700, color: C.textPrimary, marginBottom: 4, fontSize: '1.2rem' }}>
                Log ind
              </h5>
              <p style={{ fontSize: '0.88rem', color: C.textSecondary, marginBottom: 20 }}>
                Velkommen tilbage til LaundryBook.
              </p>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <input className="form-control" type="email" placeholder="Email" required autoFocus
                  value={email} onChange={(e) => setEmail(e.target.value)} />
                <input className="form-control" type="password" placeholder="Adgangskode" required
                  value={password} onChange={(e) => setPassword(e.target.value)} />
                {error && <p style={{ color: '#c62828', margin: 0, fontSize: '0.84rem' }}>{error}</p>}
                <button type="submit" className="btn fw-semibold"
                  style={{ backgroundColor: C.primary, color: '#fff', border: 'none', borderRadius: 8, padding: '10px', marginTop: 2 }}>
                  Log ind
                </button>
              </form>

              <button className="btn btn-link p-0 mt-3" type="button"
                style={{ color: C.textSecondary, fontSize: '0.84rem', textDecoration: 'none' }}
                onClick={() => setShowForgot(true)}>
                Glemt adgangskode?
              </button>

              {/* Get-started callout */}
              <div style={{ borderTop: `1px solid ${C.border}`, marginTop: 22, paddingTop: 20 }}>
                <p style={{ fontSize: '0.88rem', color: C.textSecondary, marginBottom: 12, textAlign: 'center' }}>
                  Ingen konto endnu?
                </p>
                <button className="btn fw-semibold w-100" type="button"
                  style={{
                    backgroundColor: C.primaryLight, color: C.primary,
                    border: `1px solid ${C.primaryBorder}`, borderRadius: 8, padding: '10px', fontSize: '0.92rem',
                  }}
                  onClick={() => { onClose(); go('/get-started'); }}>
                  Opret ejerforening — gratis de første 30 dage
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { LoginModal });
