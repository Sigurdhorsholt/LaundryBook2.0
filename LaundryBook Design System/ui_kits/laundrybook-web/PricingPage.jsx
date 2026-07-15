function PricingPage({ go, onLogin }) {
  const included = [
    'Ubegrænset antal beboere',
    'Ubegrænset antal vaskerum pr. ejendom',
    'Fleksible tidspladser og booking-regler',
    'Automatiske påmindelser til beboere',
    'Admin-dashboard med statistik',
    'Dansk support via mail og telefon',
    'Månedlig faktura — opsigelse hver måned',
    'Hosting i Danmark, GDPR-overholdelse',
  ];
  const sizes = [
    { beds: 'Op til 10 lejligheder', price: 199, note: 'For de mindste foreninger' },
    { beds: '11 – 30 lejligheder', price: 349, note: 'Typisk ejerforening', popular: true },
    { beds: '31 – 60 lejligheder', price: 549, note: 'Større foreninger' },
    { beds: 'Over 60 lejligheder', price: null, note: 'Kontakt os for et tilbud' },
  ];

  return (
    <PublicLayout route="/pricing" go={go} onLogin={onLogin}>
      <section style={{ backgroundColor: '#f7f3ea' }}>
        <div className="container-xl px-4" style={{ paddingTop: '4rem', paddingBottom: '3rem' }}>
          <div className="row justify-content-center">
            <div className="col-12 col-lg-8 text-center">
              <p className="mb-3" style={{ color: C.primary, fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                Priser
              </p>
              <h1 className="fw-bold mb-4"
                style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', lineHeight: 1.15, letterSpacing: '-0.6px', color: C.textPrimary }}>
                Fast pris pr. ejendom. Ingen overraskelser.
              </h1>
              <p className="mx-auto mb-0" style={{ color: C.textSecondary, fontSize: '1.1rem', lineHeight: 1.7, maxWidth: 620 }}>
                Én månedlig pris pr. ejendom, skaleret efter størrelsen. Alle funktioner er med — altid. Ingen skjulte gebyrer. Ingen prisforhøjelser uden varsel.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section style={{ backgroundColor: '#f7f3ea' }}>
        <div className="container-xl px-4" style={{ paddingBottom: '5rem' }}>
          <div className="row g-3 g-lg-4">
            {sizes.map(s => {
              const isPop = s.popular;
              return (
                <div key={s.beds} className="col-12 col-md-6 col-xl-3">
                  <div className="h-100 p-4 rounded-4 position-relative"
                    style={{
                      backgroundColor: '#fff',
                      border: isPop ? `2px solid ${C.primary}` : `1px solid ${C.border}`,
                      boxShadow: isPop ? '0 12px 36px rgba(61,122,92,0.18)' : '0 2px 8px rgba(13,59,122,0.04)',
                    }}>
                    {isPop && (
                      <span className="position-absolute px-3 py-1 rounded-pill"
                        style={{ top: -14, left: '50%', transform: 'translateX(-50%)',
                          backgroundColor: C.primary, color: '#fff', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                        Mest populær
                      </span>
                    )}
                    <p className="mb-2" style={{ color: C.textSecondary, fontSize: '0.82rem', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                      {s.beds}
                    </p>
                    <div className="mb-2" style={{ lineHeight: 1 }}>
                      {s.price !== null ? (
                        <>
                          <span className="fw-bold" style={{ fontSize: '2.4rem', color: C.textPrimary, letterSpacing: '-0.04em' }}>{s.price}</span>
                          <span className="ms-1" style={{ color: C.textSecondary, fontSize: '1rem' }}>kr/mdr</span>
                        </>
                      ) : (
                        <span className="fw-bold" style={{ fontSize: '1.6rem', color: C.textPrimary }}>Kontakt os</span>
                      )}
                    </div>
                    <p style={{ color: C.textSecondary, fontSize: '0.9rem', minHeight: 40 }}>{s.note}</p>
                    <button className="btn w-100 fw-semibold mt-2"
                      style={{
                        backgroundColor: isPop ? C.primary : '#fff',
                        color: isPop ? '#fff' : C.textPrimary,
                        border: isPop ? 'none' : `1px solid ${C.borderStrong}`,
                        borderRadius: 8, padding: '9px 0', fontSize: '0.9rem',
                      }}
                      onClick={() => s.price !== null ? onLogin() : null}>
                      {s.price !== null ? 'Kom i gang' : 'Skriv til os'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-center mt-4 mb-0" style={{ color: C.textMuted, fontSize: '0.88rem' }}>
            Alle priser er eksklusiv moms. 30 dages gratis prøveperiode — ingen betaling nødvendig.
          </p>
        </div>
      </section>

      {/* What's included */}
      <section style={{ backgroundColor: '#fff' }}>
        <div className="container-xl px-4" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
          <div className="row justify-content-center">
            <div className="col-12 col-lg-9">
              <h2 className="fw-bold mb-5 text-center" style={{ fontSize: '1.8rem', color: C.textPrimary, letterSpacing: '-0.3px' }}>
                Alt er med — uanset foreningens størrelse
              </h2>
              <div className="row g-3">
                {included.map(x => (
                  <div key={x} className="col-12 col-md-6 d-flex align-items-start gap-3">
                    <span className="d-inline-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                      style={{ width: 26, height: 26, backgroundColor: C.primaryLight, color: C.primary, marginTop: 1 }}>
                      <Icons.Check size={14} sw={2.5} />
                    </span>
                    <span style={{ color: C.textPrimary, fontSize: '0.97rem', lineHeight: 1.55 }}>{x}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Compare with alternative */}
      <section style={{ backgroundColor: C.bgPage }}>
        <div className="container-xl px-4" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
          <div className="row justify-content-center">
            <div className="col-12 col-lg-9">
              <h2 className="fw-bold mb-4 text-center" style={{ fontSize: '1.7rem', color: C.textPrimary, letterSpacing: '-0.3px' }}>
                Hvad svarer det til?
              </h2>
              <div className="p-4 p-md-5 rounded-4" style={{ backgroundColor: '#fff', border: `1px solid ${C.border}` }}>
                <div className="row align-items-center g-4">
                  <div className="col-12 col-md-6">
                    <p className="mb-2" style={{ color: C.textSecondary, fontSize: '0.88rem', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                      Typisk ejerforening
                    </p>
                    <p className="mb-0" style={{ color: C.textPrimary, fontSize: '1rem', lineHeight: 1.7 }}>
                      349 kr pr. måned fordelt på fx 20 lejligheder svarer til omkring <strong style={{ color: C.primary }}>17 kr pr. lejlighed pr. måned</strong> — mindre end en kop kaffe.
                    </p>
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="p-3 rounded-3" style={{ backgroundColor: C.primaryLight }}>
                      <p className="mb-1" style={{ color: C.primary, fontSize: '0.82rem', fontWeight: 600 }}>Med 20 lejligheder:</p>
                      <p className="mb-0 fw-bold" style={{ color: C.textPrimary, fontSize: '1.8rem', letterSpacing: '-0.02em' }}>
                        17 <span style={{ fontSize: '1rem', fontWeight: 500, color: C.textSecondary }}>kr/lejlighed/mdr</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ backgroundColor: C.primary }}>
        <div className="container-xl px-4 py-5 text-center text-white">
          <h2 className="fw-bold mb-3" style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', letterSpacing: '-0.3px' }}>Stadig i tvivl? Prøv det 30 dage gratis.</h2>
          <div className="d-flex flex-column flex-sm-row justify-content-center gap-3 mt-3">
            <button className="btn btn-lg fw-bold" onClick={() => go('/demo')}
              style={{ backgroundColor: '#fff', color: C.primary, borderRadius: 10, padding: '12px 28px', fontSize: '1rem', border: 'none' }}>
              Prøv demo først
            </button>
            <button className="btn btn-lg fw-semibold" onClick={onLogin}
              style={{ backgroundColor: 'transparent', color: '#fff', borderRadius: 10, padding: '12px 28px', fontSize: '1rem', border: '1px solid rgba(255,255,255,0.4)' }}>
              Kom i gang
            </button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

Object.assign(window, { PricingPage });
