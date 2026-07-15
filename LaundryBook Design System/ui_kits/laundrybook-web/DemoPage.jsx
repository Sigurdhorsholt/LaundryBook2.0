function DemoPage({ go, onLogin }) {
  return (
    <PublicLayout route="/demo" go={go} onLogin={onLogin}>
      <section style={{ backgroundColor: '#f7f3ea' }}>
        <div className="container-xl px-4" style={{ paddingTop: '3.5rem', paddingBottom: '2rem' }}>
          <div className="row justify-content-center">
            <div className="col-12 col-lg-8 text-center">
              <p className="mb-3" style={{ color: C.primary, fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                Prøv uden login
              </p>
              <h1 className="fw-bold mb-3"
                style={{ fontSize: 'clamp(1.9rem, 4.5vw, 2.8rem)', lineHeight: 1.15, letterSpacing: '-0.5px', color: C.textPrimary }}>
                Book en vask. Nu. Her.
              </h1>
              <p className="mx-auto mb-0" style={{ color: C.textSecondary, fontSize: '1.05rem', lineHeight: 1.65, maxWidth: 580 }}>
                Det her er den rigtige booking-oplevelse — blot med en opdigtet ejerforening. Prøv at booke en tid, aflys, skift dag. Sådan fungerer det for jeres beboere.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section style={{ backgroundColor: '#f7f3ea' }}>
        <div className="container-xl px-4" style={{ paddingBottom: '4rem' }}>
          <div className="row justify-content-center">
            <div className="col-12 col-lg-8 col-xl-7">
              {/* Phone-ish frame around the booking app */}
              <div className="rounded-4 overflow-hidden bg-white"
                style={{ border: `1px solid ${C.border}`, boxShadow: '0 24px 60px rgba(10,25,41,0.14)' }}>
                {/* Top chrome */}
                <div className="d-flex align-items-center gap-2 px-3 py-2"
                  style={{ borderBottom: `1px solid ${C.border}`, backgroundColor: '#fafbfc' }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#ff5f57' }} />
                  <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#febc2e' }} />
                  <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#28c840' }} />
                  <span className="ms-3" style={{ fontSize: '0.78rem', color: C.textMuted }}>
                    laundrybook.dk/demo · Nørrebrogade 42 (demo)
                  </span>
                </div>
                <ResidentBookingPage />
              </div>
              <p className="text-center mt-4 mb-0" style={{ color: C.textMuted, fontSize: '0.85rem' }}>
                Ingen data gemmes. Opdater siden for at nulstille demoen.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tips & admin preview */}
      <section style={{ backgroundColor: '#fff' }}>
        <div className="container-xl px-4" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
          <div className="row g-4 g-lg-5 align-items-center">
            <div className="col-12 col-lg-6">
              <h2 className="fw-bold mb-3" style={{ fontSize: '1.8rem', color: C.textPrimary, letterSpacing: '-0.3px' }}>
                Prøv disse ting i demoen
              </h2>
              <ul className="list-unstyled mb-0">
                {[
                  'Klik en ledig tidsrække i listen for at booke',
                  'Skift dag med pileknapperne i datorækken',
                  'Aflys din booking med den røde knap',
                  'Læg mærke til prikkerne — grøn = ledig, gul = næsten fuld, grå = optaget',
                ].map((t, i) => (
                  <li key={t} className="mb-3 d-flex align-items-start gap-3">
                    <span className="d-inline-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                      style={{ width: 28, height: 28, backgroundColor: C.primaryLight, color: C.primary, fontWeight: 700, fontSize: '0.82rem' }}>
                      {i + 1}
                    </span>
                    <span style={{ color: C.textPrimary, fontSize: '0.97rem', lineHeight: 1.55 }}>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="col-12 col-lg-6">
              <div className="p-4 rounded-3" style={{ backgroundColor: C.primaryLight, border: `1px solid ${C.primaryBorder}` }}>
                <h4 className="fw-bold mb-2" style={{ color: C.textPrimary, fontSize: '1.1rem' }}>Vil I også se admin-siden?</h4>
                <p style={{ color: C.textSecondary, fontSize: '0.95rem', lineHeight: 1.65 }}>
                  Log ind med en hvilken som helst email og adgangskode for at komme ind i admin-dashboardet og se hvordan bestyrelsen bruger systemet.
                </p>
                <button className="btn fw-semibold mt-1"
                  style={{ backgroundColor: C.primary, color: '#fff', borderRadius: 8, padding: '9px 22px', fontSize: '0.92rem', border: 'none' }}
                  onClick={onLogin}>
                  Log ind på admin-demo
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

Object.assign(window, { DemoPage });
