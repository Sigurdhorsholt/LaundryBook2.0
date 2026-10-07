import { Fragment } from 'react'
import { parseMarkdownLite, splitBold } from '../utils/markdownLite'
import { colors } from '../theme'

function Inline({ text }: { text: string }) {
  return <>{splitBold(text).map((part, i) => (i % 2 === 1 ? <strong key={i}>{part}</strong> : <Fragment key={i}>{part}</Fragment>))}</>
}

export function MarkdownLite({ text }: { text: string }) {
  const blocks = parseMarkdownLite(text)

  return (
    <div style={{ fontSize: '0.92rem', lineHeight: 1.6, color: colors.textPrimary, overflowWrap: 'anywhere' }}>
      {blocks.map((b, i) => {
        if (b.type === 'heading') {
          const style = { fontSize: b.level === 1 ? '1.05rem' : '0.95rem', fontWeight: 700, margin: i === 0 ? '0 0 6px' : '18px 0 6px' }
          return b.level === 1 ? <h3 key={i} style={style}><Inline text={b.text} /></h3> : <h4 key={i} style={style}><Inline text={b.text} /></h4>
        }
        if (b.type === 'list') {
          const items = b.items.map((item, j) => <li key={j}><Inline text={item} /></li>)
          const style = { margin: '0 0 12px', paddingLeft: 22 }
          return b.ordered ? <ol key={i} style={style}>{items}</ol> : <ul key={i} style={style}>{items}</ul>
        }
        return (
          <p key={i} style={{ margin: '0 0 12px' }}>
            {b.lines.map((line, j) => (
              <Fragment key={j}>
                {j > 0 && <br />}
                <Inline text={line} />
              </Fragment>
            ))}
          </p>
        )
      })}
    </div>
  )
}
