import { useTranslation } from 'react-i18next'
import { colors } from '../theme'
import { IconGlobe, IconChevronDown, IconCheck } from '../icons'
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '../../i18n'

const LANGUAGE_LABELS: Record<SupportedLanguage, { short: string; full: string }> = {
  da: { short: 'DA', full: 'Dansk' },
  en: { short: 'EN', full: 'English' },
}

export function LanguageSelector() {
  const { i18n } = useTranslation()
  const current = (SUPPORTED_LANGUAGES as readonly string[]).includes(i18n.language)
    ? (i18n.language as SupportedLanguage)
    : 'da'

  return (
    <div className="dropdown">
      <button
        className="btn btn-sm d-flex align-items-center gap-1"
        type="button"
        data-bs-toggle="dropdown"
        aria-expanded="false"
        style={{ borderRadius: 7, fontSize: '0.85rem', color: colors.textSecondary }}
      >
        <IconGlobe size={16} />
        <span className="fw-semibold">{LANGUAGE_LABELS[current].short}</span>
        <IconChevronDown size={14} />
      </button>
      <ul className="dropdown-menu dropdown-menu-end" style={{ minWidth: 140 }}>
        {SUPPORTED_LANGUAGES.map((lng) => {
          const isActive = lng === current
          return (
            <li key={lng}>
              <button
                type="button"
                className="dropdown-item d-flex align-items-center justify-content-between"
                style={{
                  fontSize: '0.9rem',
                  color: isActive ? colors.primary : colors.textPrimary,
                  fontWeight: isActive ? 600 : 400,
                }}
                onClick={() => { void i18n.changeLanguage(lng) }}
              >
                {LANGUAGE_LABELS[lng].full}
                {isActive && <IconCheck size={16} color={colors.primary} />}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
