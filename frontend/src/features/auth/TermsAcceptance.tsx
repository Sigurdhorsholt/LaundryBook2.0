import { Link } from 'react-router-dom'
import { Trans } from 'react-i18next'
import { colors } from '../../shared/theme'

interface Props {
  checked: boolean
  onChange: (checked: boolean) => void
  // Creating an association also accepts the data processing agreement on its behalf
  forAssociation?: boolean
}

const link: React.CSSProperties = { color: colors.primary, textDecoration: 'underline' }

// Only the terms are accepted. The privacy policy is information (GDPR art. 13), so it is linked
// beside the checkbox, never inside it; the liability limit is pointed out because it is a burdensome term.
export function TermsAcceptance({ checked, onChange, forAssociation }: Props) {
  return (
    <div style={{ fontSize: '0.82rem', color: colors.textSecondary, lineHeight: 1.5 }}>
      <label className="d-flex align-items-start gap-2">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} required style={{ marginTop: 3 }} />
        <span>
          <Trans
            i18nKey={forAssociation ? 'common.acceptTermsAndDpa' : 'common.acceptTerms'}
            components={{
              terms: <Link to="/vilkaar" target="_blank" style={link} />,
              dpa: <Link to="/databehandleraftale" target="_blank" style={link} />,
            }}
          />
        </span>
      </label>
      <p className="mb-0 mt-1" style={{ paddingLeft: 21 }}>
        <Trans
          i18nKey="common.acceptNotes"
          components={{
            liability: <Link to="/vilkaar#liability" target="_blank" style={link} />,
            privacy: <Link to="/privatliv" target="_blank" style={link} />,
          }}
        />
      </p>
    </div>
  )
}
