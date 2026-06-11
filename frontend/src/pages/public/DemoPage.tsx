import { PublicLayout } from './PublicLayout'
import { ResidentDemoBooking } from './ResidentDemoBooking'
import { AdminDemoSection } from './AdminDemoSection'
import { colors } from '../../shared/theme'

const TIPS = [
  'Klik en ledig tidsrække i listen for at booke',
  'Skift dag med pileknapperne i datorækken',
  'Aflys din booking med den røde knap',
  'Læg mærke til prikkerne — grøn = ledig, gul = næsten fuld, grå = optaget',
]

export function DemoPage() {
  return (
    <PublicLayout>

      <section style={{ backgroundColor: '#f7f3ea' }}>
        <div className="container-xl px-4" style={{ paddingTop: '3.5rem', paddingBottom: '2rem' }}>
          <div className="row justify-content-center">
            <div className="col-12 col-lg-8 text-center">
              <p className="mb-3" style={{ color: colors.primary, fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                Prøv uden login
              </p>
              <h1 className="fw-bold mb-3"
                style={{ fontSize: 'clamp(1.9rem, 4.5vw, 2.8rem)', lineHeight: 1.15, letterSpacing: '-0.5px', color: colors.textPrimary }}>
                Book en vask. Nu. Her.
              </h1>
              <p className="mx-auto mb-0" style={{ color: colors.textSecondary, fontSize: '1.05rem', lineHeight: 1.65, maxWidth: 580 }}>
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
              {/* Browser chrome frame */}
              <div className="rounded-4 overflow-hidden bg-white"
                style={{ border: `1px solid ${colors.borderDefault}`, boxShadow: '0 24px 60px rgba(10,25,41,0.14)' }}>
                <div className="d-flex align-items-center gap-2 px-3 py-2"
                  style={{ borderBottom: `1px solid ${colors.borderDefault}`, backgroundColor: '#fafbfc' }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#ff5f57' }} />
                  <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#febc2e' }} />
                  <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#28c840' }} />
                  <span className="ms-3" style={{ fontSize: '0.78rem', color: colors.textMuted }}>
                    laundrybook.dk/laundry · Nørrebrogade 42 (demo)
                  </span>
                </div>
                <ResidentDemoBooking />
              </div>
              <p className="text-center mt-4 mb-0" style={{ color: colors.textMuted, fontSize: '0.85rem' }}>
                Ingen data gemmes. Opdater siden for at nulstille demoen.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tips for the resident demo */}
      <section style={{ backgroundColor: '#fff' }}>
        <div className="container-xl px-4" style={{ paddingTop: '3.5rem', paddingBottom: '3.5rem' }}>
          <div className="row justify-content-center">
            <div className="col-12 col-lg-8">
              <h2 className="fw-bold mb-4" style={{ fontSize: '1.5rem', color: colors.textPrimary, letterSpacing: '-0.3px' }}>
                Prøv disse ting i demoen
              </h2>
              <div className="row g-3">
                {TIPS.map((t, i) => (
                  <div key={t} className="col-12 col-sm-6">
                    <div className="d-flex align-items-start gap-3">
                      <span className="d-inline-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                        style={{ width: 28, height: 28, backgroundColor: colors.primaryLight, color: colors.primary, fontWeight: 700, fontSize: '0.82rem' }}>
                        {i + 1}
                      </span>
                      <span style={{ color: colors.textPrimary, fontSize: '0.95rem', lineHeight: 1.55 }}>{t}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <AdminDemoSection />

    </PublicLayout>
  )
}
