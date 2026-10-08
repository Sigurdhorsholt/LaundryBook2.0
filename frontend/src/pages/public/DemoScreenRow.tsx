import { colors } from '../../shared/theme'

interface Props {
  title: string
  body: string
  preview: React.ReactNode
  // Alternates which side the picture is on, like the features page
  reverse?: boolean
}

export function DemoScreenRow({ title, body, preview, reverse = false }: Props) {
  return (
    <div className={`row align-items-center g-4 g-lg-5 mb-5 pb-3${reverse ? ' flex-lg-row-reverse' : ''}`}>
      <div className="col-12 col-lg-7">{preview}</div>
      <div className="col-12 col-lg-5">
        <h3 className="fw-bold mb-2" style={{ fontSize: '1.5rem', color: colors.textPrimary, letterSpacing: '-0.3px' }}>{title}</h3>
        <p className="mb-0" style={{ color: colors.textSecondary, fontSize: '1.02rem', lineHeight: 1.7, maxWidth: 460 }}>{body}</p>
      </div>
    </div>
  )
}
