import { useState } from 'react'
import { PublicLayout } from './PublicLayout'
import { colors } from '../../shared/theme'
import { IconPlus } from '../../shared/icons'

const CONTACT_EMAIL = 'sigurd-horsholt@hotmail.com'

const FAQ_GROUPS = [
  {
    title: 'Vask, booking og opstart',
    items: [
      ['Hvordan booker beboerne en vask?', 'De logger ind og vælger en ledig tid i kalenderen for jeres vaskerum. Ledige tider er grønne, optagede er grå. Book med ét klik — og aflys igen, hvis planerne ændrer sig.'],
      ['Hvordan kommer en beboer med?', 'En administrator i foreningen inviterer beboeren med et link. Beboeren opretter selv sin konto via invitationen.'],
      ['Virker det på mobil?', 'Ja. LaundryBook kører direkte i browseren på mobil, tablet og computer — ingen app at installere. I kan lægge en genvej på hjemmeskærmen, hvis I vil have det som en app.'],
      ['Hvordan får vi vores forening på LaundryBook, og hvad koster det?', `Skriv til os på ${CONTACT_EMAIL}, så sætter vi jeres forening op og fortæller jer prisen.`],
    ],
  },
]

function FaqItem({ q, a, last }: { q: string; a: string; last: boolean }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: last ? 'none' : `1px solid ${colors.borderDefault}`, backgroundColor: '#fff' }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-100 d-flex align-items-center justify-content-between p-3 p-md-4 border-0 bg-transparent text-start"
        style={{ color: colors.textPrimary, fontSize: '1rem', fontWeight: 600, lineHeight: 1.4, cursor: 'pointer' }}
      >
        <span style={{ flex: 1, paddingRight: 16 }}>{q}</span>
        <span style={{ transition: 'transform 0.2s', transform: open ? 'rotate(45deg)' : 'rotate(0)', color: colors.primary, flexShrink: 0 }}>
          <IconPlus size={18} strokeWidth={2.5} />
        </span>
      </button>
      {open && (
        <div className="px-3 px-md-4 pb-4" style={{ marginTop: -4 }}>
          <p className="mb-0" style={{ color: colors.textSecondary, fontSize: '0.97rem', lineHeight: 1.7, maxWidth: 640 }}>{a}</p>
        </div>
      )}
    </div>
  )
}

export function FaqPage() {
  return (
    <PublicLayout>

      <section style={{ backgroundColor: '#f7f3ea' }}>
        <div className="container-xl px-4" style={{ paddingTop: '4rem', paddingBottom: '3rem' }}>
          <div className="row justify-content-center">
            <div className="col-12 col-lg-8 text-center">
              <p className="mb-3" style={{ color: colors.primary, fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                Ofte stillede spørgsmål
              </p>
              <h1 className="fw-bold mb-3"
                style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', lineHeight: 1.15, letterSpacing: '-0.6px', color: colors.textPrimary }}>
                Svarene på det, vi oftest bliver spurgt om
              </h1>
              <p className="mx-auto mb-0" style={{ color: colors.textSecondary, fontSize: '1.05rem', lineHeight: 1.7, maxWidth: 560 }}>
                Finder I ikke det I leder efter? Skriv til {CONTACT_EMAIL}.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section style={{ backgroundColor: '#fff' }}>
        <div className="container-xl px-4" style={{ paddingTop: '3rem', paddingBottom: '4rem' }}>
          <div className="row justify-content-center">
            <div className="col-12 col-lg-9">
              {FAQ_GROUPS.map(g => (
                <div key={g.title} className="mb-5">
                  <h2 className="fw-bold mb-3" style={{ fontSize: '1.3rem', color: colors.textPrimary, letterSpacing: '-0.2px' }}>
                    {g.title}
                  </h2>
                  <div className="rounded-3 overflow-hidden" style={{ border: `1px solid ${colors.borderDefault}` }}>
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

      <section style={{ backgroundColor: colors.primaryLight }}>
        <div className="container-xl px-4 py-5 text-center">
          <h3 className="fw-bold mb-2" style={{ color: colors.textPrimary, fontSize: '1.5rem', letterSpacing: '-0.3px' }}>
            Andet I er i tvivl om?
          </h3>
          <p className="mb-3" style={{ color: colors.textSecondary, fontSize: '1rem' }}>
            Skriv til os, så vender vi tilbage.
          </p>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="btn btn-lg fw-semibold text-decoration-none"
            style={{ backgroundColor: colors.primary, color: '#fff', borderRadius: 10, padding: '10px 24px', fontSize: '0.95rem', border: 'none' }}
          >
            {CONTACT_EMAIL}
          </a>
        </div>
      </section>

    </PublicLayout>
  )
}
