import { useTranslation } from 'react-i18next'
import type { BoardMemberDto } from './propertiesApi'
import { colors } from '../../shared/theme'
import { OVERVIEW_CARD } from './constants'

interface Props {
  board: BoardMemberDto[]
  address: string
}

const subTitle: React.CSSProperties = {
  margin: '0 0 6px', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em',
  textTransform: 'uppercase', color: colors.textMuted,
}

export function PropertyBoardCard({ board, address }: Props) {
  const { t } = useTranslation()

  return (
    <section style={OVERVIEW_CARD}>
      <h2 style={{ margin: '0 0 12px', fontSize: '1rem', fontWeight: 700, color: colors.textPrimary }}>{t('propertyInfo.board.title')}</h2>
      {board.length === 0 ? (
        <p style={{ margin: 0, fontSize: '0.88rem', color: colors.textMuted }}>{t('propertyInfo.board.empty')}</p>
      ) : (
        <ul className="list-unstyled d-flex flex-column gap-3 mb-0">
          {board.map(m => (
            <li key={m.email}>
              <span className="d-block fw-semibold" style={{ fontSize: '0.9rem', color: colors.textPrimary }}>{m.name || m.email}</span>
              <a href={`mailto:${m.email}`} style={{ fontSize: '0.86rem', overflowWrap: 'anywhere' }}>{m.email}</a>
            </li>
          ))}
        </ul>
      )}

      {address && (
        <div style={{ marginTop: 18, paddingTop: 14, borderTop: `1px solid ${colors.borderRow}` }}>
          <h3 style={subTitle}>{t('propertyInfo.address')}</h3>
          <p style={{ margin: 0, fontSize: '0.88rem', color: colors.textPrimary, whiteSpace: 'pre-line' }}>{address}</p>
        </div>
      )}
    </section>
  )
}
