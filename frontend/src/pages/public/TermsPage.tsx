import { LegalPage } from './LegalPage'

const SECTIONS = [
  'acceptance', 'service', 'signupApproval', 'userResponsibility', 'payment',
  'availability', 'termination', 'changes', 'law', 'contact',
] as const

export function TermsPage() {
  return <LegalPage ns="public.terms" sectionKeys={SECTIONS} />
}
