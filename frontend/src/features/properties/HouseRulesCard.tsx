import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { MarkdownLite } from '../../shared/ui/MarkdownLite'
import { formatDateFull, localDateStr } from '../../shared/utils/dateUtils'
import { colors } from '../../shared/theme'
import { HOUSE_RULES_ANCHOR, OVERVIEW_CARD } from './constants'
import { markHouseRulesSeen } from './utils'

interface Props {
  propertyId: string
  text: string
  updatedAt: string | null
}

export function HouseRulesCard({ propertyId, text, updatedAt }: Props) {
  const { t } = useTranslation()

  useEffect(() => {
    if (updatedAt) markHouseRulesSeen(propertyId, updatedAt)
  }, [propertyId, updatedAt])

  return (
    <section id={HOUSE_RULES_ANCHOR} style={{ ...OVERVIEW_CARD, scrollMarginTop: 80 }}>
      <div className="d-flex flex-wrap justify-content-between align-items-baseline gap-2 mb-2">
        <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: colors.textPrimary }}>{t('houseRules.title')}</h2>
        {updatedAt && (
          <span style={{ fontSize: '0.8rem', color: colors.textMuted }}>
            {t('houseRules.updated', { date: formatDateFull(localDateStr(new Date(updatedAt))) })}
          </span>
        )}
      </div>
      <MarkdownLite text={text} />
    </section>
  )
}
