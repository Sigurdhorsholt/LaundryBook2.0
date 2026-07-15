import { useTranslation } from 'react-i18next'
import { PublicLayout } from './PublicLayout'
import { colors } from '../../shared/theme'

const CONTACT_EMAIL = 'sigurd-horsholt@hotmail.com'

interface LegalPageProps {
  ns: string
  sectionKeys: readonly string[]
}

export function LegalPage({ ns, sectionKeys }: LegalPageProps) {
  const { t } = useTranslation()
  const tx = t as (key: string, opts?: Record<string, unknown>) => string

  return (
    <PublicLayout>

      <section style={{ backgroundColor: '#f7f3ea' }}>
        <div className="container-xl px-4" style={{ paddingTop: '4rem', paddingBottom: '2.5rem' }}>
          <div className="row justify-content-center">
            <div className="col-12 col-lg-8">
              <p className="mb-2" style={{ color: colors.primary, fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                {tx(`${ns}.eyebrow`)}
              </p>
              <h1 className="fw-bold mb-3" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', letterSpacing: '-0.5px', color: colors.textPrimary }}>
                {tx(`${ns}.title`)}
              </h1>
              <div className="d-inline-block mb-3 px-3 py-2 rounded-2"
                style={{ backgroundColor: colors.warningBg, border: `1px solid ${colors.warningBorder}`, color: colors.warningText, fontSize: '0.85rem' }}>
                {tx(`${ns}.draftNotice`)}
              </div>
              <p className="mb-0" style={{ color: colors.textSecondary, fontSize: '1.02rem', lineHeight: 1.7 }}>
                {tx(`${ns}.intro`)}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section style={{ backgroundColor: '#fff' }}>
        <div className="container-xl px-4" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
          <div className="row justify-content-center">
            <div className="col-12 col-lg-8">
              {sectionKeys.map(k => (
                <div key={k} className="mb-4">
                  <h2 className="fw-bold mb-2" style={{ fontSize: '1.15rem', color: colors.textPrimary }}>
                    {tx(`${ns}.sections.${k}.heading`)}
                  </h2>
                  <p className="mb-0" style={{ color: colors.textSecondary, fontSize: '0.97rem', lineHeight: 1.7 }}>
                    {tx(`${ns}.sections.${k}.body`, { email: CONTACT_EMAIL })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

    </PublicLayout>
  )
}
