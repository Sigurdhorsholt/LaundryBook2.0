import 'i18next'
import type da from './locales/da.json'

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation'
    resources: { translation: typeof da }
  }
}
