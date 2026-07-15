import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import da from './locales/da.json'
import en from './locales/en.json'

export const SUPPORTED_LANGUAGES = ['da', 'en'] as const
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]

const STORAGE_KEY = 'lb-lang'

function readStoredLanguage(): SupportedLanguage {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'da' || stored === 'en') return stored
  } catch {
    // localStorage unavailable (e.g. private mode) — fall back to default
  }
  return 'da'
}

const initialLang = readStoredLanguage()

i18n.use(initReactI18next).init({
  resources: { da: { translation: da }, en: { translation: en } },
  lng: initialLang,
  fallbackLng: 'da',
  interpolation: { escapeValue: false },
  returnNull: false,
})

document.documentElement.lang = initialLang

i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng
  try {
    localStorage.setItem(STORAGE_KEY, lng)
  } catch {
    // ignore persistence failures
  }
})

export default i18n
