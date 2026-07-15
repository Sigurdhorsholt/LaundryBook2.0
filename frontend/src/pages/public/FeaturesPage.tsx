import { Link } from 'react-router-dom'
import { PublicLayout } from './PublicLayout'
import { PhotoPlaceholder } from './PhotoPlaceholder'
import { colors } from '../../shared/theme'
import { IconCheck, IconClock, IconUsers, IconSettings } from '../../shared/icons'

const BIG_FEATURES = [
  { tag: 'Booking', title: 'Som at se vejrudsigten for vaskerummet', body: 'Ledige tider er grønne, travle er gule, optagede er grå. Vælg en dag i ugen, find et tidsrum der passer, book med ét klik. Færdig. Alle i foreningen ser den samme kalender i samme sekund.', scene: 'laundry' as const },
  { tag: 'Administration', title: 'Sæt det op én gang. Glem det så.', body: 'Bestyrelsen opretter vaskerum, tidspladser og lister over lejligheder. Nye beboere tilføjes med email. Gamle beboere fjernes igen. Intet mere, intet mindre.', scene: 'hallway' as const },
  { tag: 'Overblik', title: 'Rolig statistik til generalforsamlingen', body: 'Hvor mange vaske pr. uge? Hvilke tider er mest populære? Er der behov for endnu et vaskerum? Vi viser tallene uden at lave en stor ting ud af det.', scene: 'building' as const },
]

const SMALL_FEATURES = [
  { icon: <IconClock size={22} color={colors.primary} />, title: 'Fleksible tidspladser', body: 'Definér selv længden på vaskeslots — 90 min, 2 timer, aftenslot indtil 22.' },
  { icon: <IconUsers size={22} color={colors.primary} />, title: 'Flere roller', body: 'Beboer, ejendomsadmin og systemadmin. Alle ser det de skal.' },
  { icon: <IconSettings size={22} color={colors.primary} />, title: 'Flere vaskerum pr. ejendom', body: 'Har I to kældre? Intet problem. Hver får sin egen kalender.' },
]

export function FeaturesPage() {
  return (
    <PublicLayout>

      <section style={{ backgroundColor: '#f7f3ea' }}>
        <div className="container-xl px-4" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
          <div className="row justify-content-center">
            <div className="col-12 col-lg-8 text-center">
              <p className="mb-3" style={{ color: colors.primary, fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                Hvorfor LaundryBook
              </p>
              <h1 className="fw-bold mb-4"
                style={{ fontSize: 'clamp(2rem, 5vw, 3.3rem)', lineHeight: 1.15, letterSpacing: '-0.6px', color: colors.textPrimary }}>
                Fordi vaskerum ikke behøver at være et samtaleemne
              </h1>
              <p className="mx-auto mb-0" style={{ color: colors.textSecondary, fontSize: '1.1rem', lineHeight: 1.7, maxWidth: 640 }}>
                LaundryBook fjerner friktion fra én bestemt, lille, men hverdagsvigtig del af det at bo sammen. Her er hvad det betyder i praksis.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section style={{ backgroundColor: '#fff' }}>
        <div className="container-xl px-4" style={{ paddingTop: '4rem', paddingBottom: '2rem' }}>
          {BIG_FEATURES.map((f, i) => (
            <div key={f.title} className={`row align-items-center g-5 mb-5 pb-4 ${i % 2 ? 'flex-lg-row-reverse' : ''}`}>
              <div className="col-12 col-lg-6">
                <div className="rounded-4 overflow-hidden" style={{ border: `1px solid ${colors.borderDefault}`, boxShadow: '0 8px 28px rgba(13,59,122,0.08)' }}>
                  <PhotoPlaceholder scene={f.scene} aspect="4/3" />
                </div>
              </div>
              <div className="col-12 col-lg-6">
                <span className="d-inline-block mb-3 px-3 py-1 rounded-pill"
                  style={{ backgroundColor: colors.primaryLight, color: colors.primary, fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  {f.tag}
                </span>
                <h2 className="fw-bold mb-3" style={{ fontSize: '1.75rem', color: colors.textPrimary, letterSpacing: '-0.3px', lineHeight: 1.2 }}>
                  {f.title}
                </h2>
                <p className="mb-0" style={{ color: colors.textSecondary, fontSize: '1.02rem', lineHeight: 1.75, maxWidth: 500 }}>{f.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ backgroundColor: colors.bgPage }}>
        <div className="container-xl px-4" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
          <h2 className="fw-bold mb-5 text-center" style={{ fontSize: 'clamp(1.6rem, 3vw, 2rem)', color: colors.textPrimary, letterSpacing: '-0.3px' }}>
            Flere små ting der gør det nemmere
          </h2>
          <div className="row g-4">
            {SMALL_FEATURES.map(s => (
              <div key={s.title} className="col-12 col-md-6 col-lg-4">
                <div className="h-100 p-4 rounded-3 d-flex flex-column" style={{ backgroundColor: '#fff', border: `1px solid ${colors.borderDefault}` }}>
                  <div className="mb-3 d-flex align-items-center justify-content-center rounded-2"
                    style={{ width: 44, height: 44, backgroundColor: colors.primaryLight }}>
                    {s.icon}
                  </div>
                  <h5 className="fw-semibold mb-2" style={{ color: colors.textPrimary, fontSize: '1rem' }}>{s.title}</h5>
                  <p className="mb-0" style={{ color: colors.textSecondary, fontSize: '0.92rem', lineHeight: 1.65 }}>{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ backgroundColor: '#fff' }}>
        <div className="container-xl px-4" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
          <div className="row justify-content-center">
            <div className="col-12 col-lg-9">
              <h2 className="fw-bold mb-4 text-center" style={{ fontSize: '1.9rem', color: colors.textPrimary, letterSpacing: '-0.3px' }}>
                Før og efter LaundryBook
              </h2>
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <div className="p-4 rounded-3 h-100" style={{ backgroundColor: '#fbf5f3', border: `1px solid ${colors.borderDefault}` }}>
                    <p className="fw-semibold mb-3" style={{ color: colors.textSecondary, fontSize: '0.82rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Før</p>
                    {['Seddel i kælderen der forsvinder', 'Nabo-SMS: "Har du taget lørdag 14-16?"', 'Dobbeltbookinger og sur-tøj', 'Ingen ved hvad vaskerummet faktisk bruges til'].map(x => (
                      <p key={x} className="mb-2 d-flex align-items-start gap-2" style={{ color: colors.textPrimary, fontSize: '0.95rem' }}>
                        <span style={{ color: colors.dangerText, fontWeight: 700, lineHeight: 1.5 }}>·</span>{x}
                      </p>
                    ))}
                  </div>
                </div>
                <div className="col-12 col-md-6">
                  <div className="p-4 rounded-3 h-100" style={{ backgroundColor: colors.primaryLighter, border: `1px solid ${colors.primaryBorder}` }}>
                    <p className="fw-semibold mb-3" style={{ color: colors.primary, fontSize: '0.82rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Efter</p>
                    {['En digital kalender alle beboere kender', 'Book fra sofaen, aflys når planerne skifter', 'Ingen dobbeltbookinger — systemet tillader det ikke', 'Bestyrelsen ser mønstre og kan planlægge vedligehold'].map(x => (
                      <p key={x} className="mb-2 d-flex align-items-start gap-2" style={{ color: colors.textPrimary, fontSize: '0.95rem' }}>
                        <span style={{ marginTop: 2 }}><IconCheck size={14} color={colors.primary} strokeWidth={2.5} /></span>{x}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ backgroundColor: colors.primary }}>
        <div className="container-xl px-4 py-5 text-center text-white">
          <h2 className="fw-bold mb-3" style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', letterSpacing: '-0.3px' }}>
            Den bedste måde at se det på er at prøve det
          </h2>
          <Link to="/demo" className="btn btn-lg fw-bold mt-2 text-decoration-none d-inline-flex"
            style={{ backgroundColor: '#fff', color: colors.primary, borderRadius: 10, padding: '12px 32px', fontSize: '1rem', border: 'none' }}>
            Prøv demoen
          </Link>
        </div>
      </section>

    </PublicLayout>
  )
}
