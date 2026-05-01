function AdminDashboardPage({ email }) {
  const properties = [
    { id: 'p1', name: 'Nørrebrogade 42', role: 'Ejendomsadmin', apt: '3.tv' },
    { id: 'p2', name: 'Griffenfeldsgade 18', role: 'Ejendomsadmin', apt: null },
    { id: 'p3', name: 'Blågårdsgade 7', role: 'Organisationsadmin', apt: null },
  ];
  const stats = [
    { label: 'Aktive bookinger', value: '12', sub: 'i dag' },
    { label: 'Beboere', value: '48', sub: 'registrerede' },
    { label: 'Vaskerum', value: '3', sub: 'aktive' },
  ];

  return (
    <div className="p-4 p-lg-5">
      <div className="mb-5">
        <h1 className="fw-bold mb-1" style={{ fontSize: '1.75rem', color: C.textPrimary }}>Oversigt</h1>
        <p className="mb-0" style={{ color: C.textSecondary }}>
          Velkommen tilbage, <strong>{email?.split('@')[0] || 'Sigurd'}</strong>
          <span className="ms-2 badge"
            style={{ backgroundColor: C.primaryLight, color: C.primary, fontWeight: 500, fontSize: '0.78rem' }}>
            Ejendomsadmin
          </span>
        </p>
      </div>

      {/* Stats */}
      <div className="row g-4 mb-5">
        {stats.map(s => (
          <div key={s.label} className="col-12 col-sm-6 col-xl-4">
            <div className="p-4 bg-white rounded-3 h-100" style={{ border: `1px solid ${C.border}` }}>
              <p className="mb-1" style={{ color: C.textSecondary, fontSize: '0.85rem', fontWeight: 500 }}>{s.label}</p>
              <p className="fw-bold mb-0" style={{ fontSize: '2rem', color: C.textPrimary, lineHeight: 1.1 }}>{s.value}</p>
              <p className="mb-0 mt-1" style={{ color: C.textMuted, fontSize: '0.8rem' }}>{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Properties */}
      <div>
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h2 className="fw-semibold mb-0" style={{ fontSize: '1rem', color: C.textPrimary }}>Dine ejendomme</h2>
        </div>
        <div className="row g-3">
          {properties.map(p => (
            <div key={p.id} className="col-12 col-md-6 col-xl-4">
              <div className="bg-white rounded-3 p-3 d-flex align-items-center gap-3"
                style={{ border: `1px solid ${C.border}`, cursor: 'pointer', transition: 'box-shadow 0.15s' }}
                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(13,59,122,0.09)')}
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}>
                <div className="rounded-2 d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ width: 40, height: 40, backgroundColor: C.primaryLight }}>
                  <Icons.Building size={18} color={C.primary} />
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p className="fw-semibold mb-0 text-truncate" style={{ fontSize: '0.9rem', color: C.textPrimary }}>
                    {p.name}
                  </p>
                  <p className="mb-0" style={{ fontSize: '0.78rem', color: C.textSecondary }}>
                    {p.role}{p.apt ? ` · Lejl. ${p.apt}` : ''}
                  </p>
                </div>
                <span className="flex-shrink-0"><Icons.ChevRight size={16} color={C.textMuted} /></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { AdminDashboardPage });
