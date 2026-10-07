import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useUpdateHouseRulesMutation } from './propertiesApi'
import { MarkdownLite } from '../../shared/ui/MarkdownLite'
import { FormError } from '../../shared/ui'
import { extractErrorMessage } from '../../shared/utils/errorUtils'
import { formatDateFull, localDateStr } from '../../shared/utils/dateUtils'
import { colors } from '../../shared/theme'
import { HOUSE_RULES_MAX_LENGTH, OVERVIEW_CARD } from './constants'

interface Props {
  propertyId: string
  saved: string | null
  updatedAt: string | null
}

const cardTitle: React.CSSProperties = { margin: '0 0 4px', fontSize: '1rem', fontWeight: 700, color: colors.textPrimary }

export function HouseRulesEditor({ propertyId, saved, updatedAt }: Props) {
  const { t } = useTranslation()
  const fieldId = useId()
  const [updateHouseRules, { isLoading: saving, isSuccess }] = useUpdateHouseRulesMutation()
  // Only what the admin has typed; until then the saved text shows, so a refetch can't overwrite an edit
  const [draft, setDraft] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const value = draft ?? saved ?? ''
  // The server trims, so a trailing newline must not keep the form looking unsaved
  const dirty = draft !== null && draft.trim() !== (saved ?? '').trim()
  // Drop the draft once the server's copy catches up with it. Not on every keystroke: a draft that
  // only differs by a trailing space or newline would be thrown away while the admin is typing.
  const [prevSaved, setPrevSaved] = useState(saved)
  if (prevSaved !== saved) {
    setPrevSaved(saved)
    if (draft !== null && !dirty) setDraft(null)
  }

  async function save() {
    setError(null)
    try {
      await updateHouseRules({ propertyId, text: value }).unwrap()
    } catch (err) {
      setError(extractErrorMessage(err, t('houseRules.saveFailed')))
    }
  }

  return (
    <div className="row g-4">
      <div className="col-12 col-xl-6">
        <section style={OVERVIEW_CARD}>
          <label htmlFor={fieldId} style={cardTitle}>{t('houseRules.editorTitle')}</label>
          <p style={{ margin: '0 0 10px', fontSize: '0.85rem', color: colors.textSecondary }}>{t('houseRules.formatHelp')}</p>
          <textarea
            id={fieldId}
            className="form-control"
            rows={18}
            maxLength={HOUSE_RULES_MAX_LENGTH}
            placeholder={t('houseRules.placeholder')}
            value={value}
            onChange={e => setDraft(e.target.value)}
            style={{ fontSize: '0.9rem', lineHeight: 1.5, resize: 'vertical' }}
          />
          <div className="d-flex justify-content-between mt-1" style={{ fontSize: '0.78rem', color: colors.textMuted }}>
            <span>{updatedAt ? t('houseRules.lastUpdated', { date: formatDateFull(localDateStr(new Date(updatedAt))) }) : ''}</span>
            <span>{value.length.toLocaleString()} / {HOUSE_RULES_MAX_LENGTH.toLocaleString()}</span>
          </div>
          <FormError message={error} />
          <div className="d-flex align-items-center gap-3 mt-3">
            <button type="button" className="btn btn-primary fw-semibold" disabled={!dirty || saving} onClick={save}>
              {saving ? t('houseRules.saving') : t('houseRules.save')}
            </button>
            {dirty && (
              <button type="button" className="btn btn-outline-secondary" disabled={saving} onClick={() => setDraft(null)}>
                {t('houseRules.undo')}
              </button>
            )}
            {isSuccess && !dirty && <span role="status" style={{ fontSize: '0.85rem', color: colors.successText, fontWeight: 500 }}>{t('houseRules.saved')}</span>}
          </div>
        </section>
      </div>
      <div className="col-12 col-xl-6">
        <section style={OVERVIEW_CARD}>
          <h2 style={cardTitle}>{t('houseRules.previewTitle')}</h2>
          <p style={{ margin: '0 0 12px', fontSize: '0.85rem', color: colors.textSecondary }}>{t('houseRules.previewHelp')}</p>
          <div style={{ borderTop: `1px solid ${colors.borderRow}`, paddingTop: 12 }}>
            {value.trim()
              ? <MarkdownLite text={value} />
              : <p style={{ margin: 0, fontSize: '0.88rem', color: colors.textMuted }}>{t('houseRules.previewEmpty')}</p>}
          </div>
        </section>
      </div>
    </div>
  )
}
