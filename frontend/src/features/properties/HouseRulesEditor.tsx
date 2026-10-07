import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useUpdateHouseRulesMutation } from './propertiesApi'
import { MarkdownEditor } from '../../shared/ui/markdownEditor/MarkdownEditor'
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

export function HouseRulesEditor({ propertyId, saved, updatedAt }: Props) {
  const { t } = useTranslation()
  const titleId = useId()
  const [updateHouseRules, { isLoading: saving, isSuccess }] = useUpdateHouseRulesMutation()
  // The editor's text once the admin has changed something; until then the saved text applies
  const [draft, setDraft] = useState<string | null>(null)
  // A new editor key reloads the saved text, which is how "Kassér ændringer" works
  const [resets, setResets] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const value = draft ?? saved ?? ''
  // The server trims, so a trailing newline must not keep the form looking unsaved
  const dirty = draft !== null && draft.trim() !== (saved ?? '').trim()
  const tooLong = value.length > HOUSE_RULES_MAX_LENGTH
  // Drop the draft once the server's copy catches up with it
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

  function discard() {
    setDraft(null)
    setResets(n => n + 1)
  }

  return (
    <section style={{ ...OVERVIEW_CARD, maxWidth: 860 }}>
      <h2 id={titleId} style={{ margin: '0 0 4px', fontSize: '1rem', fontWeight: 700, color: colors.textPrimary }}>{t('houseRules.editorTitle')}</h2>
      <p style={{ margin: '0 0 12px', fontSize: '0.85rem', color: colors.textSecondary }}>{t('houseRules.formatHelp')}</p>
      <MarkdownEditor
        key={resets}
        initialText={saved ?? ''}
        labelledBy={titleId}
        placeholder={t('houseRules.placeholder')}
        onChange={setDraft}
      />
      <div className="d-flex justify-content-between mt-1" style={{ fontSize: '0.78rem', color: colors.textMuted }}>
        <span>{updatedAt ? t('houseRules.lastUpdated', { date: formatDateFull(localDateStr(new Date(updatedAt))) }) : ''}</span>
        <span style={tooLong ? { color: colors.dangerText, fontWeight: 600 } : undefined}>
          {value.length.toLocaleString()} / {HOUSE_RULES_MAX_LENGTH.toLocaleString()}
        </span>
      </div>
      <FormError message={error} />
      <div className="d-flex align-items-center gap-3 mt-3">
        <button type="button" className="btn btn-primary fw-semibold" disabled={!dirty || saving || tooLong} onClick={save}>
          {saving ? t('houseRules.saving') : t('houseRules.save')}
        </button>
        {dirty && (
          <button type="button" className="btn btn-outline-secondary" disabled={saving} onClick={discard}>
            {t('houseRules.undo')}
          </button>
        )}
        {isSuccess && !dirty && <span role="status" style={{ fontSize: '0.85rem', color: colors.successText, fontWeight: 500 }}>{t('houseRules.saved')}</span>}
      </div>
    </section>
  )
}
