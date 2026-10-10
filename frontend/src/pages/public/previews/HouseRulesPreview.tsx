import { useTranslation } from 'react-i18next'
import { MarkdownLite } from '../../../shared/ui/MarkdownLite'
import { PageHeader } from '../../../shared/ui'
import { OVERVIEW_CARD } from '../../../features/properties/constants'
import { colors } from '../../../shared/theme'
import { BrowserFrame } from './BrowserFrame'
import { PreviewAppBar } from './PreviewAppBar'
import { PREVIEW_HOUSE_RULES, PREVIEW_PROPERTY } from './previewData'

const TOOLBAR = ['heading', 'subheading', 'bold', 'bulletList', 'numberedList'] as const

// The admin's house-rules editor. The real one loads Lexical (about 100 kB), too much for a marketing
// page, so this draws its toolbar and frame with the editor's own labels and CSS around the real renderer.
export function HouseRulesPreview() {
  const { t } = useTranslation()

  return (
    <BrowserFrame label={t('public.previews.houseRulesAlt')} url="laundrybook.dk/admin/house-rules" designWidth={1000}>
      <PreviewAppBar admin active={2} />
      <div style={{ padding: '28px 32px' }}>
        <PageHeader eyebrow={PREVIEW_PROPERTY} title={t('houseRules.title')} description={t('houseRules.adminDescription')} />
        <section style={{ ...OVERVIEW_CARD, maxWidth: 860 }}>
          <h2 style={{ margin: '0 0 4px', fontSize: '1rem', fontWeight: 700, color: colors.textPrimary }}>{t('houseRules.editorTitle')}</h2>
          <p style={{ margin: '0 0 12px', fontSize: '0.85rem', color: colors.textSecondary }}>{t('houseRules.formatHelp')}</p>
          <div className="d-flex flex-wrap gap-1 mb-2">
            {TOOLBAR.map(key => (
              <span key={key} className={`btn btn-sm btn-outline-secondary${key === 'bulletList' ? ' active' : ''}`} style={key === 'bold' ? { fontWeight: 700 } : undefined}>
                {t(`markdownEditor.${key}`)}
              </span>
            ))}
          </div>
          <div className="md-editor">
            <div className="md-editor-content" style={{ minHeight: 0 }}>
              <MarkdownLite text={PREVIEW_HOUSE_RULES} />
            </div>
          </div>
          <div className="d-flex align-items-center gap-3 mt-3">
            <span className="btn btn-primary fw-semibold">{t('houseRules.save')}</span>
          </div>
        </section>
      </div>
    </BrowserFrame>
  )
}
