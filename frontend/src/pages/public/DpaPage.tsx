import { LegalPage } from './LegalPage'

const SECTIONS = [
  'parties', 'clauses', 'subject', 'categories', 'subprocessors', 'instructions', 'security',
  'transfers', 'assistance', 'breach', 'deletion', 'audit', 'term',
] as const

export function DpaPage() {
  return <LegalPage ns="public.dpa" sectionKeys={SECTIONS} />
}
