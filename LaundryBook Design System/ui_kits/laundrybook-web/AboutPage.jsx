function AboutPage({ go, onLogin }) {
  return (
    <PublicLayout route="/about" go={go} onLogin={onLogin}>
      {/* Intro */}
      <section style={{ backgroundColor: '#f7f3ea' }}>
        <div className="container-xl px-4" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
          <div className="row justify-content-center">
            <div className="col-12 col-lg-9 text-center">
              <p className="mb-3" style={{ color: C.primary, fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                Om LaundryBook
              </p>
              <h1 className="fw-bold mb-4"
                style={{ fontSize: 'clamp(2rem, 5vw, 3.3rem)', lineHeight: 1.15, letterSpacing: '-0.6px', color: C.textPrimary }}>
                Bygget af naboer, til naboer
              </h1>
              <p className="mx-auto" style={{ color: C.textSecondary, fontSize: '1.1rem', lineHeight: 1.7, maxWidth: 620 }}>
                Vi startede LaundryBook fordi bookingsedlen i kælderen på Nørrebrogade 42 blev væk for tredje gang på et år. Der måtte være en bedre måde — og der var ikke nogen der havde lavet den endnu.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Founding story with image */}
      <section style={{ backgroundColor: '#fff' }}>
        <div className="container-xl px-4" style={{ paddingTop: '5rem', paddingBottom: '3rem' }}>
          <div className="row align-items-center g-5">
            <div className="col-12 col-lg-6">
              <div className="rounded-4 overflow-hidden" style={{ border: `1px solid ${C.border}` }}>
                <PhotoPlaceholder scene="hallway" aspect="4/3" />
              </div>
            </div>
            <div className="col-12 col-lg-6">
              <h2 className="fw-bold mb-3" style={{ fontSize: '1.9rem', color: C.textPrimary, letterSpacing: '-0.3px' }}>
                Vores historie
              </h2>
              <p style={{ color: C.textSecondary, fontSize: '1rem', lineHeight: 1.75 }}>
                I 2023 sad Sigurd og Mette — to beboere i en mindre ejerforening på Nørrebro — og diskuterede hvorfor noget så hverdagsagtigt som at booke en vask skulle være så besværligt. Papirsedler, e-mails, en SMS til naboen for at høre om torsdag klokken 18 var fri.
              </p>
              <p style={{ color: C.textSecondary, fontSize: '1rem', lineHeight: 1.75 }}>
                De byggede en prototype i en weekend. To foreninger tog den i brug. Derefter tre, så otte. I dag bruger 47 ejerforeninger i Storkøbenhavn, Aarhus og Odense LaundryBook hver uge.
              </p>
              <p className="mb-0" style={{ color: C.textSecondary, fontSize: '1rem', lineHeight: 1.75 }}>
                Vi er stadig et lille team på fire. Det bliver vi nok ved med at være.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section style={{ backgroundColor: C.bgPage }}>
        <div className="container-xl px-4" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
          <div className="row justify-content-center mb-5">
            <div className="col-12 col-lg-7 text-center">
              <h2 className="fw-bold mb-0" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.1rem)', color: C.textPrimary, letterSpacing: '-0.3px' }}>
                Hvad vi tror på
              </h2>
            </div>
          </div>
          <div className="row g-4">
            {[
              { t: 'Enkelthed fremfor funktioner', b: 'Vi tilføjer ikke noget fordi vi kan. Vi tilføjer det kun når en forening beder om det — og vi får et klart "ja, det ville hjælpe" fra tre mere.' },
              { t: 'Hverdagsværktøj, ikke platform', b: 'LaundryBook skal opføre sig som en god tørretumbler: starte når man trykker på knappen, stoppe når den er færdig. Ingen opslagstavler, ingen notifikationsbjerge.' },
              { t: 'Jeres data, jeres forening', b: 'Vi sælger ikke beboerdata. Vi hoster i Danmark. I kan eksportere alt, når som helst — også hvis I en dag vælger at skifte.' },
            ].map(v => (
              <div key={v.t} className="col-12 col-md-4">
                <div className="h-100 p-4 rounded-3" style={{ backgroundColor: '#fff', border: `1px solid ${C.border}` }}>
                  <h4 className="fw-semibold mb-3" style={{ color: C.textPrimary, fontSize: '1.1rem' }}>{v.t}</h4>
                  <p className="mb-0" style={{ color: C.textSecondary, fontSize: '0.95rem', lineHeight: 1.7 }}>{v.b}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section style={{ backgroundColor: '#fff' }}>
        <div className="container-xl px-4" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
          <div className="row justify-content-center mb-5">
            <div className="col-12 col-lg-7 text-center">
              <h2 className="fw-bold mb-2" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.1rem)', color: C.textPrimary, letterSpacing: '-0.3px' }}>
                Teamet
              </h2>
              <p style={{ color: C.textSecondary, fontSize: '1rem' }}>Fire personer. Alle bor selv i ejerforeninger. Alle vasker selv deres tøj.</p>
            </div>
          </div>
          <div className="row g-4 justify-content-center">
            {[
              { n: 'Sigurd Holm', r: 'Medstifter · Produkt', bg: '#d9b88a', ini: 'SH' },
              { n: 'Mette Lindqvist', r: 'Medstifter · Teknik', bg: '#3d7a5c', ini: 'ML' },
              { n: 'Anders Bjerre', r: 'Design', bg: '#c88a6a', ini: 'AB' },
              { n: 'Laila Bak', r: 'Kundesupport', bg: '#5a6a7a', ini: 'LB' },
            ].map(p => (
              <div key={p.n} className="col-6 col-md-3 text-center">
                <div className="rounded-4 mx-auto mb-3 d-flex align-items-center justify-content-center"
                  style={{ width: 120, height: 140, backgroundColor: p.bg, color: '#fff', fontSize: '2.2rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
                  {p.ini}
                </div>
                <p className="fw-semibold mb-0" style={{ color: C.textPrimary, fontSize: '0.95rem' }}>{p.n}</p>
                <p className="mb-0" style={{ color: C.textSecondary, fontSize: '0.85rem' }}>{p.r}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact strip */}
      <section style={{ backgroundColor: C.primaryLight }}>
        <div className="container-xl px-4 py-5">
          <div className="row align-items-center g-3">
            <div className="col-12 col-md-8">
              <h3 className="fw-bold mb-1" style={{ color: C.textPrimary, fontSize: '1.3rem' }}>Vil I høre mere?</h3>
              <p className="mb-0" style={{ color: C.textSecondary, fontSize: '0.95rem' }}>
                Skriv til <a href="mailto:hej@laundrybook.dk" style={{ color: C.primary, fontWeight: 600 }}>hej@laundrybook.dk</a> — vi svarer gerne samme dag.
              </p>
            </div>
            <div className="col-12 col-md-4 text-md-end">
              <button className="btn btn-lg fw-semibold"
                style={{ backgroundColor: C.primary, color: '#fff', borderRadius: 10, padding: '10px 24px', fontSize: '0.95rem', border: 'none' }}
                onClick={() => go('/demo')}>
                Prøv demo først
              </button>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

Object.assign(window, { AboutPage });
