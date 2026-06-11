import { colors } from '../../shared/theme'

const STEPS = [
  {
    num: '1',
    title: 'Opret konto',
    body: 'Email og kodeord — tager under et minut.',
  },
  {
    num: '2',
    title: 'Opret din ejendom',
    body: 'Navn, adresse og antal lejligheder. Vi sætter resten op for dig.',
  },
  {
    num: '3',
    title: 'Opsæt vaskerum',
    body: 'Tilføj rum og definer tidspladser én gang. Systemet kører derefter selv.',
  },
  {
    num: '4',
    title: 'Inviter beboere',
    body: 'Send et link — beboerne opretter sig selv på få sekunder.',
  },
]

export function GetStartedSteps() {
  return (
    <section style={{ backgroundColor: '#fff' }}>
      <div className="container-xl px-4" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
        <p className="text-center fw-semibold mb-5"
          style={{ color: colors.primary, fontSize: '0.82rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          Sådan fungerer det
        </p>
        <div className="row g-4">
          {STEPS.map((s, i) => (
            <div key={s.num} className="col-12 col-sm-6 col-lg-3">
              <div className="h-100 p-4 rounded-4 position-relative"
                style={{ backgroundColor: colors.bgPage, border: `1px solid ${colors.borderDefault}` }}>
                {i < STEPS.length - 1 && (
                  <div className="d-none d-lg-block position-absolute"
                    style={{ top: '2.1rem', right: '-1.1rem', width: '2.2rem', height: 2, backgroundColor: colors.borderStrong, zIndex: 1 }} />
                )}
                <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                  style={{ width: 36, height: 36, backgroundColor: colors.primaryLight, color: colors.primary, fontWeight: 700, fontSize: '0.9rem' }}>
                  {s.num}
                </div>
                <h3 className="fw-bold mb-2" style={{ fontSize: '1rem', color: colors.textPrimary }}>
                  {s.title}
                </h3>
                <p className="mb-0" style={{ color: colors.textSecondary, fontSize: '0.9rem', lineHeight: 1.6 }}>
                  {s.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
