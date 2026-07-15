import { LegalPage } from './LegalPage'

const SECTIONS = [
  'controller', 'data', 'purpose', 'legalBasis', 'subprocessors',
  'retention', 'rights', 'security', 'cookies', 'changes', 'contact',
] as const

export function PrivacyPage() {
  return <LegalPage ns="public.privacy" sectionKeys={SECTIONS} />
}
