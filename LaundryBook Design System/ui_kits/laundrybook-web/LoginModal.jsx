function LoginModal({ onClose, onSuccess }) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showForgot, setShowForgot] = React.useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email && password) onSuccess(email);
  };

  return (
    <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{ backgroundColor: 'rgba(10,25,41,0.55)', zIndex: 2000, padding: 16 }}
      onClick={onClose}>
      <div className="bg-white rounded-3 p-4" style={{ width: '100%', maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h5 className="fw-bold mb-0" style={{ color: C.textPrimary, fontSize: '1.15rem' }}>
            {showForgot ? 'Glemt adgangskode' : 'Log ind'}
          </h5>
          <button className="btn-close" onClick={onClose} />
        </div>

        {showForgot ? (
          <>
            <input className="form-control mb-2" type="email" placeholder="Email" />
            <button className="btn btn-primary w-100 fw-semibold" style={{ backgroundColor: C.primary, borderColor: C.primary }}>
              Send nulstillingslink
            </button>
            <button className="btn btn-link p-0 mt-2" onClick={() => setShowForgot(false)} style={{ color: C.primary, fontSize: 14 }}>
              ← Tilbage til login
            </button>
          </>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input className="form-control" type="email" placeholder="Email" required
              value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
            <input className="form-control" type="password" placeholder="Adgangskode" required
              value={password} onChange={(e) => setPassword(e.target.value)} />
            <button className="btn fw-semibold" type="submit"
              style={{ backgroundColor: C.primary, color: '#fff', borderColor: C.primary }}>
              Log ind
            </button>
            <button className="btn btn-link p-0" type="button" onClick={() => setShowForgot(true)}
              style={{ color: C.primary, fontSize: 14 }}>
              Glemt adgangskode?
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { LoginModal });
