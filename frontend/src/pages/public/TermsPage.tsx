import { LegalPage } from './LegalPage'

const SECTIONS = [
  'parties', 'conclusion', 'service', 'age', 'signupApproval', 'association', 'userResponsibility',
  'payment', 'availability', 'liability', 'termination', 'changes', 'law', 'contact',
] as const

export function TermsPage() {
  return <LegalPage ns="public.terms" sectionKeys={SECTIONS} />
}
