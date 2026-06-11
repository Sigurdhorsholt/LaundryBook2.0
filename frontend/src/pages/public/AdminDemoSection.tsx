import { useState } from 'react'
import { Link } from 'react-router-dom'
import { colors } from '../../shared/theme'
import { IconBuilding, IconChevronRight, IconPlus } from '../../shared/icons'

type TabId = 'dashboard' | 'users' | 'rooms' | 'settings'

const TABS: { id: TabId; label: string }[] = [
  { id: 'dashboard', label: 'Oversigt' },
  { id: 'users',     label: 'Beboere' },
  { id: 'rooms',     label: 'Lokaler' },
  { id: 'settings',  label: 'Indstillinger' },
]

// ── Main export ────────────────────────────────────────────────────────────────

export function AdminDemoSection() {
  const [active, setActive] = useState<TabId>('dashboard')

  return (
    <section style={{ backgroundColor: colors.bgSubtle }}>
      <div className="container-xl px-4" style={{ paddingTop: '4.5rem', paddingBottom: '4.5rem' }}>

        <div className="row justify-content-center mb-4">
          <div className="col-12 col-lg-9 text-center">
            <p className="mb-2" style={{ color: colors.primary, fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              Admin-panelet
            </p>
            <h2 className="fw-bold mb-3" style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)', letterSpacing: '-0.3px', color: colors.textPrimary }}>
              Fuld kontrol til bestyrelsen
            </h2>
            <p className="mx-auto mb-0" style={{ color: colors.textSecondary, fontSize: '1rem', lineHeight: 1.65, maxWidth: 560 }}>
              Opsæt bookingsregler, inviter beboere og se alt fra ét sted — ingen teknisk viden krævet.
            </p>
          </div>
        </div>

        <div className="row justify-content-center">
          <div className="col-12 col-lg-10">
            <div className="rounded-4 overflow-hidden bg-white"
              style={{ border: `1px solid ${colors.borderDefault}`, boxShadow: '0 24px 60px rgba(10,25,41,0.12)' }}>

              {/* Chrome bar */}
              <div className="d-flex align-items-center gap-2 px-3 py-2"
                style={{ borderBottom: `1px solid ${colors.borderDefault}`, backgroundColor: '#fafbfc' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#ff5f57' }} />
                <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#febc2e' }} />
                <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#28c840' }} />
                <span className="ms-3" style={{ fontSize: '0.78rem', color: colors.textMuted }}>
                  laundrybook.dk/admin · Nørrebrogade 42 (demo)
                </span>
              </div>

              {/* Tab bar */}
              <div className="d-flex align-items-end px-2 pt-1"
                style={{ borderBottom: `1px solid ${colors.borderDefault}`, backgroundColor: colors.bgPage, overflowX: 'auto' }}>
                {TABS.map(tab => {
                  const isActive = tab.id === active
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActive(tab.id)}
                      className="btn btn-sm flex-shrink-0"
                      style={{
                        borderRadius: '6px 6px 0 0',
                        padding: '7px 16px',
                        fontSize: '0.82rem',
                        fontWeight: isActive ? 600 : 400,
                        color: isActive ? colors.primary : colors.textSecondary,
                        backgroundColor: isActive ? '#fff' : 'transparent',
                        border: 'none',
                        borderBottom: isActive ? `2px solid ${colors.primary}` : '2px solid transparent',
                      }}
                    >
                      {tab.label}
                    </button>
                  )
                })}
              </div>

              {/* Tab content */}
              <div style={{ minHeight: 340 }}>
                {active === 'dashboard'  && <DashboardTab />}
                {active === 'users'      && <UsersTab />}
                {active === 'rooms'      && <RoomsTab />}
                {active === 'settings'   && <SettingsTab />}
              </div>
            </div>

            {/* CTA */}
            <div className="text-center mt-4">
              <Link
                to="/signup"
                className="btn fw-semibold text-decoration-none"
                style={{
                  backgroundColor: colors.primary, color: '#fff',
                  borderRadius: 10, padding: '12px 32px', fontSize: '0.95rem', border: 'none',
                }}
              >
                Opret jeres forening →
              </Link>
              <p className="mt-2 mb-0" style={{ fontSize: '0.8rem', color: colors.textMuted }}>Vi aktiverer foreningen, så snart vi har set den.</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}

// ── Dashboard tab ─────────────────────────────────────────────────────────────

function DashboardTab() {
  return (
    <div className="p-3 p-md-4">
      <div className="mb-4">
        <h5 className="fw-bold mb-1" style={{ fontSize: '1.4rem', color: colors.textPrimary }}>Oversigt</h5>
        <p className="mb-0" style={{ fontSize: '0.85rem', color: colors.textSecondary }}>
          Velkommen tilbage, Sigurd
          <span className="ms-2 badge" style={{ backgroundColor: colors.primaryLight, color: colors.primary, fontWeight: 500, fontSize: '0.75rem' }}>
            Ejendomsadmin
          </span>
        </p>
      </div>
      <div className="row g-3 mb-4">
        {[
          { label: 'Aktive bookinger', value: '12', sub: 'i dag' },
          { label: 'Beboere', value: '48', sub: 'registrerede' },
          { label: 'Vaskerum', value: '2', sub: 'aktive' },
        ].map(s => (
          <div key={s.label} className="col-12 col-sm-4">
            <div className="p-3 rounded-3" style={{ border: `1px solid ${colors.borderDefault}`, backgroundColor: '#fff' }}>
              <p className="mb-1" style={{ color: colors.textSecondary, fontSize: '0.8rem', fontWeight: 500 }}>{s.label}</p>
              <p className="fw-bold mb-0" style={{ fontSize: '1.8rem', color: colors.textPrimary, lineHeight: 1.1 }}>{s.value}</p>
              <p className="mb-0 mt-1" style={{ color: colors.textMuted, fontSize: '0.75rem' }}>{s.sub}</p>
            </div>
          </div>
        ))}
      </div>
      <h6 className="fw-semibold mb-3" style={{ fontSize: '0.9rem', color: colors.textPrimary }}>Dine ejendomme</h6>
      {[
        { name: 'Nørrebrogade 42', role: 'Ejendomsadmin' },
        { name: 'Griffenfeldsgade 18', role: 'Ejendomsadmin' },
      ].map(p => (
        <div key={p.name} className="d-flex align-items-center gap-3 p-3 rounded-3 mb-2"
          style={{ border: `1px solid ${colors.borderDefault}`, backgroundColor: '#fff' }}>
          <div className="rounded-2 d-flex align-items-center justify-content-center flex-shrink-0"
            style={{ width: 38, height: 38, backgroundColor: colors.primaryLight }}>
            <IconBuilding size={16} color={colors.primary} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p className="fw-semibold mb-0 text-truncate" style={{ fontSize: '0.88rem', color: colors.textPrimary }}>{p.name}</p>
            <p className="mb-0" style={{ fontSize: '0.76rem', color: colors.textSecondary }}>{p.role}</p>
          </div>
          <IconChevronRight size={15} color={colors.textMuted} />
        </div>
      ))}
    </div>
  )
}

// ── Users tab ─────────────────────────────────────────────────────────────────

const MOCK_MEMBERS = [
  { name: 'Anna Hansen',       apt: '1A', admin: false, active: true  },
  { name: 'Bo Pedersen',       apt: '2B', admin: false, active: true  },
  { name: 'Camilla Larsen',    apt: '3C', admin: true,  active: true  },
  { name: 'David Nielsen',     apt: '4D', admin: false, active: true  },
  { name: 'Emma Christensen',  apt: null, admin: false, active: false },
]

function UsersTab() {
  return (
    <div className="p-3 p-md-4">
      <div className="d-flex align-items-start justify-content-between gap-3 mb-4 flex-wrap">
        <div>
          <h5 className="fw-bold mb-1" style={{ fontSize: '1.4rem', color: colors.textPrimary }}>Beboere</h5>
          <p className="mb-0" style={{ fontSize: '0.85rem', color: colors.textSecondary }}>Nørrebrogade 42 · 5 beboere</p>
        </div>
        <button className="btn btn-sm d-flex align-items-center gap-1 fw-semibold"
          style={{ backgroundColor: colors.primary, color: '#fff', border: 'none', borderRadius: 8, fontSize: '0.82rem', padding: '7px 14px' }}>
          <IconPlus size={14} /> Inviter beboer
        </button>
      </div>
      <div className="rounded-3 overflow-hidden" style={{ border: `1px solid ${colors.borderDefault}` }}>
        {MOCK_MEMBERS.map((m, i) => (
          <div key={m.name} className="d-flex align-items-center gap-3 px-3 py-2"
            style={{ borderBottom: i < MOCK_MEMBERS.length - 1 ? `1px solid ${colors.borderRow}` : 'none', opacity: m.active ? 1 : 0.55 }}>
            <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
              style={{ width: 32, height: 32, backgroundColor: colors.primaryLight, fontWeight: 700, fontSize: '0.75rem', color: colors.primary }}>
              {m.name.charAt(0)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p className="fw-semibold mb-0 text-truncate" style={{ fontSize: '0.85rem', color: colors.textPrimary }}>{m.name}</p>
              <p className="mb-0" style={{ fontSize: '0.75rem', color: colors.textSecondary }}>{m.apt ? `Lejl. ${m.apt}` : '—'}</p>
            </div>
            <span className="badge flex-shrink-0" style={{
              backgroundColor: m.admin ? colors.primaryLight : colors.bgSubtle,
              color: m.admin ? colors.primary : colors.textSecondary,
              fontWeight: 500, fontSize: '0.72rem',
            }}>
              {m.admin ? 'Admin' : 'Beboer'}
            </span>
            <span style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
              backgroundColor: m.active ? colors.dotFree : colors.dotFull }} />
          </div>
        ))}
      </div>
      <p className="mt-2 mb-0" style={{ fontSize: '0.76rem', color: colors.textMuted }}>
        + 1 invitation afventer svar
      </p>
    </div>
  )
}

// ── Rooms tab ─────────────────────────────────────────────────────────────────

function RoomsTab() {
  const rooms = [
    { name: 'Vaskerum 1', machines: ['Vaskemaskine A', 'Tørretumbler B', 'Vaskemaskine C'] },
    { name: 'Vaskerum 2', machines: ['Vaskemaskine D'] },
  ]
  return (
    <div className="p-3 p-md-4">
      <div className="d-flex align-items-start justify-content-between gap-3 mb-4 flex-wrap">
        <div>
          <h5 className="fw-bold mb-1" style={{ fontSize: '1.4rem', color: colors.textPrimary }}>Lokaler & Maskiner</h5>
          <p className="mb-0" style={{ fontSize: '0.85rem', color: colors.textSecondary }}>Nørrebrogade 42</p>
        </div>
        <button className="btn btn-sm d-flex align-items-center gap-1 fw-semibold"
          style={{ backgroundColor: colors.primary, color: '#fff', border: 'none', borderRadius: 8, fontSize: '0.82rem', padding: '7px 14px' }}>
          <IconPlus size={14} /> Tilføj lokale
        </button>
      </div>
      <div className="d-flex flex-column gap-3">
        {rooms.map(room => (
          <div key={room.name} className="rounded-3 overflow-hidden" style={{ border: `1px solid ${colors.borderDefault}` }}>
            <div className="d-flex align-items-center justify-content-between px-3 py-2"
              style={{ backgroundColor: colors.bgPage, borderBottom: `1px solid ${colors.borderDefault}` }}>
              <span className="fw-semibold" style={{ fontSize: '0.9rem', color: colors.textPrimary }}>{room.name}</span>
              <span className="badge" style={{ backgroundColor: colors.primaryLight, color: colors.primary, fontWeight: 500, fontSize: '0.72rem' }}>
                Aktiv
              </span>
            </div>
            {room.machines.map((m, i) => (
              <div key={m} className="d-flex align-items-center px-3 py-2"
                style={{ borderBottom: i < room.machines.length - 1 ? `1px solid ${colors.borderRow}` : 'none' }}>
                <span style={{ fontSize: '0.82rem', color: colors.textSecondary }}>{m}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Settings tab ──────────────────────────────────────────────────────────────

function SettingsTab() {
  return (
    <div className="p-3 p-md-4">
      <div className="mb-4">
        <h5 className="fw-bold mb-1" style={{ fontSize: '1.4rem', color: colors.textPrimary }}>Indstillinger</h5>
        <p className="mb-0" style={{ fontSize: '0.85rem', color: colors.textSecondary }}>Nørrebrogade 42 · Gælder for alle beboere.</p>
      </div>
      <div style={{ maxWidth: 520 }}>
        <SettingGroup label="Bookingtype" description="Hvad booker beboerne?">
          <MockRadio label="Specifik maskine" desc="Beboeren vælger præcis hvilken maskine" checked />
          <MockRadio label="Helt lokale" desc="Beboeren booker adgang til hele vaskerummet" />
        </SettingGroup>
        <SettingGroup label="Synlighed i kalenderen" description="Hvad ser andre beboere?">
          <MockRadio label="Lejlighedsnummer" desc='Andre ser "Lejl. 1A" — navne vises ikke' checked />
          <MockRadio label="Fuldt navn" desc='Andre ser beboerens fulde navn' />
          <MockRadio label="Anonymt" desc='Andre ser kun "Optaget"' />
        </SettingGroup>
        <div className="d-flex flex-wrap gap-3">
          {[
            { label: 'Fremtidshorisont', value: '14 dage' },
            { label: 'Afbestillingsfrist', value: '2 timer' },
            { label: 'Maks. bookinger', value: '2 pr. beboer' },
          ].map(s => (
            <div key={s.label} className="rounded-3 px-3 py-2" style={{ border: `1px solid ${colors.borderDefault}`, backgroundColor: colors.bgPage }}>
              <p className="mb-0" style={{ fontSize: '0.75rem', color: colors.textSecondary }}>{s.label}</p>
              <p className="fw-semibold mb-0" style={{ fontSize: '0.92rem', color: colors.textPrimary }}>{s.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function SettingGroup({ label, description, children }: { label: string; description: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <p className="fw-semibold mb-0" style={{ fontSize: '0.88rem', color: colors.textPrimary }}>{label}</p>
      <p className="mb-2" style={{ fontSize: '0.8rem', color: colors.textSecondary }}>{description}</p>
      <div className="d-flex flex-column gap-2">{children}</div>
    </div>
  )
}

function MockRadio({ label, desc, checked = false }: { label: string; desc: string; checked?: boolean }) {
  return (
    <div className="d-flex align-items-start gap-2 p-2 rounded-3"
      style={{
        border: `1.5px solid ${checked ? colors.primary : colors.borderDefault}`,
        backgroundColor: checked ? colors.primaryLighter : '#fff',
      }}>
      <span style={{
        width: 15, height: 15, borderRadius: '50%', flexShrink: 0, marginTop: 2,
        border: `2px solid ${checked ? colors.primary : colors.borderStrong}`,
        backgroundColor: checked ? colors.primary : '#fff',
        display: 'inline-block',
      }} />
      <div>
        <p className="fw-semibold mb-0" style={{ fontSize: '0.82rem', color: colors.textPrimary }}>{label}</p>
        <p className="mb-0" style={{ fontSize: '0.75rem', color: colors.textSecondary }}>{desc}</p>
      </div>
    </div>
  )
}
