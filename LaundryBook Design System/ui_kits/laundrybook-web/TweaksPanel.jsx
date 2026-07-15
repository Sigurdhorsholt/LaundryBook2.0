// Tweaks panel — exposes hero variant + other knobs while the top-bar Tweaks toggle is on.

function TweaksPanel({ tweaks, setTweaks }) {
  const [open, setOpen] = React.useState(true);

  const options = [
    { key: 'heroVariant', label: 'Landing hero layout', type: 'select',
      values: [
        { v: 'warmsage', l: 'Warm sage (asymmetric, photo)' },
        { v: 'deepblue', l: 'Deep blue (original, centered)' },
        { v: 'editorial', l: 'Editorial (huge type, photo trio)' },
      ] },
  ];

  const commit = (patch) => {
    const next = { ...tweaks, ...patch };
    setTweaks(next);
    window.parent.postMessage({ type: '__edit_mode_set_keys', edits: patch }, '*');
  };

  return (
    <div className="position-fixed"
      style={{ right: 16, bottom: 16, width: 300, zIndex: 3000,
        backgroundColor: '#fff', border: `1px solid ${C.border}`, borderRadius: 12,
        boxShadow: '0 18px 48px rgba(10,25,41,0.22)', overflow: 'hidden',
        fontFamily: 'Inter, sans-serif' }}>
      <button onClick={() => setOpen(!open)}
        className="w-100 d-flex align-items-center justify-content-between border-0 bg-transparent px-3 py-2"
        style={{ borderBottom: open ? `1px solid ${C.border}` : 'none', cursor: 'pointer' }}>
        <span className="fw-bold" style={{ color: C.textPrimary, fontSize: '0.9rem' }}>Tweaks</span>
        <span style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s', color: C.textMuted, fontSize: 12 }}>▾</span>
      </button>
      {open && (
        <div className="p-3">
          {options.map(o => (
            <div key={o.key} className="mb-2">
              <label className="form-label" style={{ fontSize: '0.78rem', color: C.textSecondary, fontWeight: 600, marginBottom: 4 }}>{o.label}</label>
              {o.type === 'select' && (
                <select className="form-select form-select-sm"
                  value={tweaks[o.key]}
                  onChange={(e) => commit({ [o.key]: e.target.value })}
                  style={{ fontSize: '0.85rem' }}>
                  {o.values.map(v => <option key={v.v} value={v.v}>{v.l}</option>)}
                </select>
              )}
            </div>
          ))}
          <p className="mt-3 mb-0" style={{ fontSize: '0.72rem', color: C.textMuted, lineHeight: 1.5 }}>
            Bruger vælger af 3 hero-layouts til landingsiden.
          </p>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { TweaksPanel });
