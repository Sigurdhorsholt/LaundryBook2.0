import type { CSSProperties } from 'react'

export function badge(bg: string, color: string): CSSProperties {
  return {
    display: 'inline-block',
    padding: '3px 10px',
    borderRadius: 20,
    backgroundColor: bg,
    color,
    fontSize: '0.78rem',
    fontWeight: 500,
    whiteSpace: 'nowrap',
  }
}
