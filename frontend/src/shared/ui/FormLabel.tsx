import type { ReactNode } from 'react'
import { colors } from '../theme'

interface FormLabelProps {
  children: ReactNode
  hint?: string
  htmlFor?: string
}

export function FormLabel({ children, hint, htmlFor }: FormLabelProps) {
  return (
    <label className="form-label" htmlFor={htmlFor} style={{ fontSize: '0.85rem', fontWeight: 500, color: colors.textPrimary }}>
      {children}
      {hint && <span style={{ color: colors.textMuted, fontWeight: 400 }}> {hint}</span>}
    </label>
  )
}
