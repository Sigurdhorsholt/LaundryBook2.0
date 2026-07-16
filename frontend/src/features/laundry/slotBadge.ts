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

/** High-contrast filled badge — reserved for the user's own booking. */
export function solidBadge(bg: string, color: string): CSSProperties {
  return {
    ...badge(bg, color),
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    padding: '4px 11px',
    fontWeight: 600,
  }
}
