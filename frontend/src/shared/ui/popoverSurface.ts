import { colors } from '../theme'

// The card look of AnchoredPopover; the public site's previews draw a static popover with it
export const POPOVER_SURFACE: React.CSSProperties = {
  boxSizing: 'border-box',
  backgroundColor: colors.bgCard,
  border: `1px solid ${colors.borderDefault}`,
  borderRadius: 12,
  boxShadow: '0 14px 36px rgba(18,32,26,0.24)',
  padding: '14px 16px',
}
