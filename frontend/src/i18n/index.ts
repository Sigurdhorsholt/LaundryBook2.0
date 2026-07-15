import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import da from './locales/da.json'

i18n.use(initReactI18next).init({
  resources: { da: { translation: da } },
  lng: 'da',
  fallbackLng: 'da',
  interpolation: { escapeValue: false },
  returnNull: false,
})

export default i18n
