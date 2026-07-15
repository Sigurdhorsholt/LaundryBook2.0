// Shared primitives — icons, brand, navbar, sidebar, small utilities.
// Colors mirror src/shared/theme.ts (Warm Sage active).

const C = {
  primary: '#3d7a5c',
  primaryLight: '#e8f5ee',
  primaryLighter: '#f2faf5',
  primaryBorder: '#b8ddc9',
  textPrimary: '#1a2e24',
  textSecondary: '#5a6a7a',
  textMuted: '#a0adb8',
  bgPage: '#f8fafb',
  bgCard: '#ffffff',
  bgSubtle: '#f0f4f8',
  border: '#e8ecf0',
  borderStrong: '#d0d8e0',
  successText: '#2e7d32',
  successBg: '#f0fdf4',
  successBorder: '#c8e6c9',
  warningText: '#b45309',
  warningBg: '#fff8e1',
  warningBorder: '#ffe0b2',
  dangerText: '#c62828',
  dangerBorder: '#f8bbd0',
  slotTakenBg: '#f2f4f7',
  slotTakenText: '#8a9aaa',
  dotFree: '#4caf50',
  dotFew: '#f59e0b',
  dotFull: '#e0e0e0',
  heroStart: '#0a1929',
  heroMid: '#0d3b7a',
  heroEnd: '#1565c0',
  heroAccent: '#4fc3f7',
};

const I = (path, o = {}) => {
  const { size = 16, color = 'currentColor', sw = 2 } = o;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
      strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
      dangerouslySetInnerHTML={{ __html: path }} />
  );
};

const Icons = {
  Grid:    (p) => I('<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>', p),
  Building:(p) => I('<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>', p),
  Calendar:(p) => I('<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>', p),
  CalendarCheck:(p) => I('<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M9 16l2 2 4-4"/>', p),
  Users:   (p) => I('<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>', p),
  Settings:(p) => I('<circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2"/>', p),
  Clock:   (p) => I('<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>', p),
  ChevLeft:(p) => I('<polyline points="15 18 9 12 15 6"/>', p),
  ChevRight:(p)=> I('<polyline points="9 18 15 12 9 6"/>', p),
  Plus:    (p) => I('<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>', p),
  Check:   (p) => I('<polyline points="20 6 9 17 4 12"/>', p),
  Menu:    (p) => I('<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>', p),
  Brand:   (p) => I('<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><path d="M2 12h3M19 12h3M12 2v3M12 19v3"/>', p),
};

function BrandLogo({ size = 22, color = C.primary }) {
  return <Icons.Brand size={size} color={color} />;
}

function Navbar({ isAdmin, route, go, onLogout }) {
  const links = [
    ...(isAdmin ? [] : [{ to: '/laundry', label: 'Vaskebooking' }]),
    ...(isAdmin ? [{ to: '/admin', label: 'Admin' }] : []),
    { to: '/my-page', label: 'Min side' },
  ];
  return (
    <nav className="sticky-top border-bottom flex-shrink-0"
      style={{ backgroundColor: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(10px)', zIndex: 1040 }}>
      <div className="container-fluid px-3 px-lg-4 d-flex align-items-center" style={{ height: 56 }}>
        <a className="navbar-brand d-flex align-items-center gap-2 fw-bold text-decoration-none"
          style={{ color: C.textPrimary, fontSize: '1.05rem', letterSpacing: '-0.2px' }}
          onClick={(e) => { e.preventDefault(); go(isAdmin ? '/admin' : '/laundry'); }} href="#">
          <BrandLogo size={18} />
          LaundryBook
          {isAdmin && (
            <span className="badge ms-1" style={{ backgroundColor: C.primaryLight, color: C.primary, fontSize: '0.7rem', fontWeight: 600 }}>
              Admin
            </span>
          )}
        </a>
        <div className="d-none d-md-flex align-items-center gap-1 ms-auto">
          {links.map(l => {
            const active = route === l.to;
            return (
              <a key={l.to} href="#" onClick={(e) => { e.preventDefault(); go(l.to); }} className="btn btn-sm"
                style={{ borderRadius: 7, fontSize: '0.85rem',
                  color: active ? C.primary : C.textSecondary,
                  backgroundColor: active ? C.primaryLight : undefined,
                  fontWeight: active ? 600 : undefined }}>
                {l.label}
              </a>
            );
          })}
          <button className="btn btn-sm btn-outline-secondary ms-1" style={{ borderRadius: 7, fontSize: '0.85rem' }} onClick={onLogout}>
            Log ud
          </button>
        </div>
      </div>
    </nav>
  );
}

function Sidebar({ route, go }) {
  const items = [
    { to: '/admin', label: 'Dashboard', icon: <Icons.Grid size={15} /> },
    { to: '/admin/properties', label: 'Ejendomme', icon: <Icons.Building size={15} /> },
    { to: '/admin/users', label: 'Brugere', icon: <Icons.Users size={15} /> },
  ];
  return (
    <div className="bg-white border-end flex-shrink-0 d-none d-lg-flex flex-column" style={{ width: 256 }}>
      <nav className="p-3 flex-grow-1">
        <p className="px-2 mb-1 mt-1 text-uppercase fw-semibold"
          style={{ fontSize: '0.67rem', letterSpacing: '0.09em', color: C.textMuted }}>Oversigt</p>
        {items.map(it => {
          const active = route === it.to;
          return (
            <a key={it.to} href="#" onClick={(e) => { e.preventDefault(); go(it.to); }}
              className="d-flex align-items-center gap-2 px-3 py-2 rounded-2 text-decoration-none fw-medium mb-1"
              style={{
                fontSize: '0.875rem',
                color: active ? C.primary : C.textSecondary,
                backgroundColor: active ? C.primaryLight : 'transparent',
              }}>
              <span style={{ opacity: 0.7, display: 'flex' }}>{it.icon}</span>
              {it.label}
            </a>
          );
        })}
      </nav>
      <div className="px-4 py-3 border-top" style={{ borderColor: C.border }}>
        <p className="mb-0 text-truncate" style={{ fontSize: '0.75rem', color: C.textMuted }}>sigurd@example.dk</p>
      </div>
    </div>
  );
}

Object.assign(window, { C, Icons, BrandLogo, Navbar, Sidebar });
