function FaqPage({ go, onLogin }) {
  const groups = [
    {
      title: 'Kom godt i gang',
      items: [
        ['Hvor hurtigt kan vi være i gang?',
          'De fleste foreninger er oppe på under en time. I opretter ejendommen, tilføjer beboerne med deres email, og opsætter tidspladser for vaskerummet. Beboerne får automatisk en velkomstmail.'],
        ['Hvem kan oprette foreningen?',
          'Typisk en person fra bestyrelsen eller jeres ejendomsadministrator. Vedkommende bliver automatisk ejendomsadmin og kan derefter invitere resten.'],
        ['Kan vi prøve det først?',
          'Ja. I kan prøve en live demo uden login på vores demoside, og I får 30 dages gratis prøveperiode når I opretter jeres egen forening.'],
      ],
    },
    {
      title: 'For beboere',
      items: [
        ['Skal beboerne installere en app?',
          'Nej. LaundryBook virker direkte i browseren på mobil, tablet og computer. Beboerne kan lave en genvej til hjemmeskærmen hvis de vil have det som en app.'],
        ['Hvad hvis en beboer ikke har en email?',
          'I kan oprette en beboer uden email — de får en simpel kode i stedet. Det er sjældent nødvendigt, men muligheden er der.'],
        ['Kan beboere se hinandens bookinger?',
          'De kan se at en tid er optaget, men ikke hvem der har booket den. Det holder det neutralt.'],
      ],
    },
    {
      title: 'Pris og opsigelse',
      items: [
        ['Hvad sker der efter prøveperioden?',
          'Hvis I ikke opsiger inden 30 dage, får I den første faktura. Ingen automatisk binding — I kan opsige hver måned, og vi beder ikke om kortoplysninger i prøveperioden.'],
        ['Kan vi skifte pakke undervejs?',
          'Ja, hvis foreningen vokser eller skrumper. Vi tilpasser prisen til næste faktureringsperiode.'],
        ['Får I en opstartsfaktura?',
          'Nej. Ingen opsætningsgebyrer.'],
      ],
    },
    {
      title: 'Teknik og data',
      items: [
        ['Hvor opbevares vores data?',
          'Hos en dansk hosting-leverandør. Vi sælger aldrig beboerdata, og I kan eksportere det hele som en CSV-fil når som helst.'],
        ['Er der integration med ejendomsadministratorer?',
          'Ikke direkte i dag. Vi har CSV-eksport af bookinghistorik, som de fleste administratorer kan importere.'],
        ['Hvad hvis systemet går ned?',
          'Vi viser status live på status.laundrybook.dk. Ved nedetid over en time krediterer vi den månedlige pris automatisk.'],
      ],
    },
  ];

  return (
    <PublicLayout route="/faq" go={go} onLogin={onLogin}>
      <section style={{ backgroundColor: '#f7f3ea' }}>
        <div className="container-xl px-4" style={{ paddingTop: '4rem', paddingBottom: '3rem' }}>
          <div className="row justify-content-center">
            <div className="col-12 col-lg-8 text-center">
              <p className="mb-3" style={{ color: C.primary, fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                Ofte stillede spørgsmål
              </p>
              <h1 className="fw-bold mb-3"
                style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', lineHeight: 1.15, letterSpacing: '-0.6px', color: C.textPrimary }}>
                Svarene på det, vi oftest bliver spurgt om
              </h1>
              <p className="mx-auto mb-0" style={{ color: C.textSecondary, fontSize: '1.05rem', lineHeight: 1.7, maxWidth: 560 }}>
                Finder I ikke det I leder efter? Skriv til hej@laundrybook.dk — vi svarer gerne samme dag.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section style={{ backgroundColor: '#fff' }}>
        <div className="container-xl px-4" style={{ paddingTop: '3rem', paddingBottom: '4rem' }}>
          <div className="row justify-content-center">
            <div className="col-12 col-lg-9">
              {groups.map(g => (
                <div key={g.title} className="mb-5">
                  <h2 className="fw-bold mb-3" style={{ fontSize: '1.3rem', color: C.textPrimary, letterSpacing: '-0.2px' }}>
                    {g.title}
                  </h2>
                  <div className="rounded-3 overflow-hidden" style={{ border: `1px solid ${C.border}` }}>
                    {g.items.map(([q, a], i) => (
                      <FaqItem key={q} q={q} a={a} last={i === g.items.length - 1} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section style={{ backgroundColor: C.primaryLight }}>
        <div className="container-xl px-4 py-5 text-center">
          <h3 className="fw-bold mb-2" style={{ color: C.textPrimary, fontSize: '1.5rem', letterSpacing: '-0.3px' }}>
            Andet I er i tvivl om?
          </h3>
          <p className="mb-3" style={{ color: C.textSecondary, fontSize: '1rem' }}>
            Vi svarer på mails fra foreninger før vi åbner slack-beskeder fra os selv.
          </p>
          <a href="mailto:hej@laundrybook.dk" className="btn btn-lg fw-semibold"
            style={{ backgroundColor: C.primary, color: '#fff', borderRadius: 10, padding: '10px 24px', fontSize: '0.95rem', border: 'none', textDecoration: 'none' }}>
            hej@laundrybook.dk
          </a>
        </div>
      </section>
    </PublicLayout>
  );
}

function FaqItem({ q, a, last }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div style={{ borderBottom: last ? 'none' : `1px solid ${C.border}`, backgroundColor: '#fff' }}>
      <button onClick={() => setOpen(!open)}
        className="w-100 d-flex align-items-center justify-content-between p-3 p-md-4 border-0 bg-transparent text-start"
        style={{ color: C.textPrimary, fontSize: '1rem', fontWeight: 600, lineHeight: 1.4, cursor: 'pointer' }}>
        <span style={{ flex: 1, paddingRight: 16 }}>{q}</span>
        <span style={{ transition: 'transform 0.2s', transform: open ? 'rotate(45deg)' : 'rotate(0)', color: C.primary, flexShrink: 0 }}>
          <Icons.Plus size={18} sw={2.5} />
        </span>
      </button>
      {open && (
        <div className="px-3 px-md-4 pb-4" style={{ marginTop: -4 }}>
          <p className="mb-0" style={{ color: C.textSecondary, fontSize: '0.97rem', lineHeight: 1.7, maxWidth: 640 }}>{a}</p>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { FaqPage });
