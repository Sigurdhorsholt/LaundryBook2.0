import { LegalPage } from './LegalPage'

const SECTIONS = [
  'roles', 'operator', 'data', 'association', 'own', 'recipients', 'transfers',
  'retention', 'rights', 'objection', 'complaint', 'cookies', 'security', 'changes', 'contact',
] as const

export function PrivacyPage() {
  return <LegalPage ns="public.privacy" sectionKeys={SECTIONS} />
}
