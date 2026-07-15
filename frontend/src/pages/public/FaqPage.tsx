import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PublicLayout } from './PublicLayout'
import { colors } from '../../shared/theme'
import { IconPlus } from '../../shared/icons'

const CONTACT_EMAIL = 'sigurd-horsholt@hotmail.com'

const FAQ_GROUPS = [
  {
    key: 'washingBookingStart',
    items: ['booking', 'join', 'mobile', 'pricing'] as const,
  },
] as const

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
  const { t } = useTranslation()

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_GROUPS.flatMap(g =>
      g.items.map(item => ({
        '@type': 'Question',
        name: t(`public.faq.groups.${g.key}.items.${item}.q`),
        acceptedAnswer: {
          '@type': 'Answer',
          text: t(`public.faq.groups.${g.key}.items.${item}.a`, { email: CONTACT_EMAIL }),
        },
      })),
    ),
  }

  return (
    <PublicLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <section style={{ backgroundColor: '#f7f3ea' }}>
        <div className="container-xl px-4" style={{ paddingTop: '4rem', paddingBottom: '3rem' }}>
          <div className="row justify-content-center">
            <div className="col-12 col-lg-8 text-center">
              <p className="mb-3" style={{ color: colors.primary, fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                {t('public.faq.eyebrow')}
              </p>
              <h1 className="fw-bold mb-3"
                style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', lineHeight: 1.15, letterSpacing: '-0.6px', color: colors.textPrimary }}>
                {t('public.faq.title')}
              </h1>
              <p className="mx-auto mb-0" style={{ color: colors.textSecondary, fontSize: '1.05rem', lineHeight: 1.7, maxWidth: 560 }}>
                {t('public.faq.subtitle', { email: CONTACT_EMAIL })}
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
                <div key={g.key} className="mb-5">
                  <h2 className="fw-bold mb-3" style={{ fontSize: '1.3rem', color: colors.textPrimary, letterSpacing: '-0.2px' }}>
                    {t(`public.faq.groups.${g.key}.title`)}
                  </h2>
                  <div className="rounded-3 overflow-hidden" style={{ border: `1px solid ${colors.borderDefault}` }}>
                    {g.items.map((item, i) => (
                      <FaqItem
                        key={item}
                        q={t(`public.faq.groups.${g.key}.items.${item}.q`)}
                        a={t(`public.faq.groups.${g.key}.items.${item}.a`, { email: CONTACT_EMAIL })}
                        last={i === g.items.length - 1}
                      />
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
            {t('public.faq.moreDoubtsTitle')}
          </h3>
          <p className="mb-3" style={{ color: colors.textSecondary, fontSize: '1rem' }}>
            {t('public.faq.moreDoubtsSubtitle')}
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
