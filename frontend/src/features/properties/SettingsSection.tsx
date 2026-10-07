import { colors } from '../../shared/theme'

interface Props {
  title: string
  description: string
  children: React.ReactNode
}

// Explanation beside the controls on wide screens, stacked above them on narrow ones
export function SettingsSection({ title, description, children }: Props) {
  return (
    <section className="settings-section row g-3 py-4">
      <div className="col-12 col-lg-4">
        <h2 className="fw-semibold mb-1" style={{ fontSize: '1rem', color: colors.textPrimary }}>{title}</h2>
        <p className="mb-0" style={{ fontSize: '0.85rem', color: colors.textSecondary }}>{description}</p>
      </div>
      <div className="col-12 col-lg-8">{children}</div>
    </section>
  )
}
