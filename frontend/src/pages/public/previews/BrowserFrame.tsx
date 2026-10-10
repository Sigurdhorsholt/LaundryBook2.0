import { ScaledToFit } from './ScaledToFit'
import { colors } from '../../../shared/theme'

interface Props {
  // Read out instead of the picture; the content inside is real UI but only for looking at
  label: string
  url: string
  designWidth: number
  children: React.ReactNode
}

export function BrowserFrame({ label, url, designWidth, children }: Props) {
  return (
    <div
      role="img"
      aria-label={label}
      style={{ borderRadius: 14, overflow: 'hidden', border: `1px solid ${colors.borderDefault}`, backgroundColor: colors.bgCard, boxShadow: '0 24px 60px rgba(18,32,26,0.16)' }}
    >
      <div className="d-flex align-items-center gap-2" style={{ padding: '9px 12px', backgroundColor: colors.bgSubtle, borderBottom: `1px solid ${colors.borderDefault}` }}>
        {[0, 1, 2].map(i => <span key={i} style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: colors.borderDefault }} />)}
        <span style={{ marginLeft: 8, flex: 1, maxWidth: 360, padding: '3px 12px', borderRadius: 999, backgroundColor: colors.bgCard, border: `1px solid ${colors.borderDefault}`, fontSize: '0.72rem', color: colors.textMuted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {url}
        </span>
      </div>
      <ScaledToFit designWidth={designWidth}>
        <div inert aria-hidden="true" style={{ backgroundColor: colors.bgPage }}>{children}</div>
      </ScaledToFit>
    </div>
  )
}
