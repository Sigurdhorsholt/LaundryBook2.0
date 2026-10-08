import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PublicLayout } from './PublicLayout'
import { PageMeta } from '../../shared/PageMeta'
import { DemoScreenRow } from './DemoScreenRow'
import { WeekGridPreview } from './previews/WeekGridPreview'
import { PhonePreview } from './previews/PhonePreview'
import { PropertyPreview } from './previews/PropertyPreview'
import { AdminPreview } from './previews/AdminPreview'
import { AdminBookingsPreview } from './previews/AdminBookingsPreview'
import { HouseRulesPreview } from './previews/HouseRulesPreview'
import { colors } from '../../shared/theme'

const sectionTitle: React.CSSProperties = { fontSize: 'clamp(1.6rem, 3vw, 2.1rem)', color: colors.textPrimary, letterSpacing: '-0.4px' }

// Screenshots of the real UI with made-up data, residents first and the admin further down
export function DemoPage() {
  const { t } = useTranslation()
  return (
    <PublicLayout>
      <PageMeta page="demo" />

      <section style={{ backgroundColor: colors.bgSubtle }}>
        <div className="container-xl px-4 text-center" style={{ paddingTop: '3.5rem', paddingBottom: '3rem' }}>
          <p className="mb-3" style={{ color: colors.primary, fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            {t('public.demo.eyebrow')}
          </p>
          <h1 className="fw-bold mb-3" style={{ fontSize: 'clamp(1.9rem, 4.5vw, 2.8rem)', lineHeight: 1.15, letterSpacing: '-0.5px', color: colors.textPrimary }}>
            {t('public.demo.title')}
          </h1>
          <p className="mx-auto mb-0" style={{ color: colors.textSecondary, fontSize: '1.05rem', lineHeight: 1.65, maxWidth: 600 }}>
            {t('public.demo.subtitle')}
          </p>
        </div>
      </section>

      <section style={{ backgroundColor: colors.bgCard }}>
        <div className="container-xl px-4" style={{ paddingTop: '4rem', paddingBottom: '2rem' }}>
          <h2 className="fw-bold mb-5" style={sectionTitle}>{t('public.demo.residentsTitle')}</h2>
          <DemoScreenRow title={t('public.demo.screens.book.title')} body={t('public.demo.screens.book.body')} preview={<WeekGridPreview withPopover />} />
          <DemoScreenRow title={t('public.demo.screens.phone.title')} body={t('public.demo.screens.phone.body')} preview={<PhonePreview width={300} />} reverse />
          <DemoScreenRow title={t('public.demo.screens.property.title')} body={t('public.demo.screens.property.body')} preview={<PropertyPreview />} />
        </div>
      </section>

      <section style={{ backgroundColor: colors.bgSubtle }}>
        <div className="container-xl px-4" style={{ paddingTop: '4rem', paddingBottom: '2rem' }}>
          <h2 className="fw-bold mb-5" style={sectionTitle}>{t('public.demo.adminTitle')}</h2>
          <DemoScreenRow title={t('public.demo.screens.overview.title')} body={t('public.demo.screens.overview.body')} preview={<AdminPreview focus="today" />} />
          <DemoScreenRow title={t('public.demo.screens.bookings.title')} body={t('public.demo.screens.bookings.body')} preview={<AdminBookingsPreview />} reverse />
          <DemoScreenRow title={t('public.demo.screens.houseRules.title')} body={t('public.demo.screens.houseRules.body')} preview={<HouseRulesPreview />} />
        </div>
      </section>

      <section style={{ backgroundColor: colors.primary }}>
        <div className="container-xl px-4 py-5 text-center" style={{ color: colors.bgCard }}>
          <h2 className="fw-bold mb-2" style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', letterSpacing: '-0.3px' }}>{t('public.demo.ctaTitle')}</h2>
          <p className="mb-4" style={{ fontSize: '1.02rem' }}>{t('public.demo.ctaBody')}</p>
          <Link to="/get-started" className="btn btn-lg fw-bold text-decoration-none"
            style={{ backgroundColor: colors.bgCard, color: colors.primary, borderRadius: 10, padding: '12px 32px', fontSize: '1rem', border: 'none' }}>
            {t('public.demo.ctaButton')}
          </Link>
        </div>
      </section>
    </PublicLayout>
  )
}
