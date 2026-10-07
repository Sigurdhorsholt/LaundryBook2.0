export type MarkdownBlock =
  | { type: 'heading'; level: 1 | 2; text: string }
  | { type: 'paragraph'; lines: string[] }
  | { type: 'list'; ordered: boolean; items: string[] }

const BULLET = /^\s*[-*]\s+(.*)$/
const NUMBERED = /^\s*\d+[.)]\s+(.*)$/
const HEADING = /^\s*(#{1,2})\s+(.*)$/

// Just enough structure for house rules written by a volunteer board: headings, paragraphs and
// lists. It returns data, never HTML, so whatever is typed can't inject markup.
export function parseMarkdownLite(text: string): MarkdownBlock[] {
  const blocks: MarkdownBlock[] = []
  let paragraph: string[] = []
  let list: { ordered: boolean; items: string[] } | null = null

  const flush = () => {
    if (paragraph.length > 0) blocks.push({ type: 'paragraph', lines: paragraph })
    if (list) blocks.push({ type: 'list', ...list })
    paragraph = []
    list = null
  }

  for (const raw of text.replace(/\r\n/g, '\n').split('\n')) {
    const line = raw.trimEnd()
    if (line.trim() === '') { flush(); continue }

    const heading = HEADING.exec(line)
    if (heading) {
      flush()
      blocks.push({ type: 'heading', level: heading[1]!.length === 1 ? 1 : 2, text: heading[2]!.trim() })
      continue
    }

    const bullet = BULLET.exec(line)
    const numbered = bullet ? null : NUMBERED.exec(line)
    const item = bullet ?? numbered
    if (item) {
      const ordered = numbered !== null
      if (paragraph.length > 0 || (list && list.ordered !== ordered)) flush()
      list ??= { ordered, items: [] }
      list.items.push(item[1]!.trim())
      continue
    }

    if (list) flush()
    paragraph.push(line.trim())
  }
  flush()
  return blocks
}

// Splits "**bold**" runs out of a line; odd indexes are the bold parts
export function splitBold(line: string): string[] {
  return line.split(/\*\*(.+?)\*\*/g)
}
