import {
  $createLineBreakNode,
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $isElementNode,
  $isLineBreakNode,
  $isTextNode,
  type ElementNode,
  type LexicalNode,
} from 'lexical'
import { $createHeadingNode, $isHeadingNode } from '@lexical/rich-text'
import { $createListItemNode, $createListNode, $isListItemNode, $isListNode, type ListNode } from '@lexical/list'
import { HEADING, ORDERED_LIST, UNORDERED_LIST, BOLD_STAR, type ElementTransformer, type Transformer } from '@lexical/markdown'
import { parseMarkdownLite, splitBold } from '../../utils/markdownLite'

// The editor reads and writes the same markdown-lite text the resident page renders, through our own
// parser rather than Lexical's markdown converter, which treats single newlines differently.

function $appendInline(parent: ElementNode, text: string) {
  splitBold(text).forEach((part, i) => {
    if (!part) return
    const node = $createTextNode(part)
    if (i % 2 === 1) node.toggleFormat('bold')
    parent.append(node)
  })
}

export function $nodesFromMarkdownLite(text: string): ElementNode[] {
  return parseMarkdownLite(text).map(block => {
    if (block.type === 'heading') {
      const heading = $createHeadingNode(block.level === 1 ? 'h1' : 'h2')
      $appendInline(heading, block.text)
      return heading
    }
    if (block.type === 'list') {
      const list = $createListNode(block.ordered ? 'number' : 'bullet')
      for (const item of block.items) {
        const li = $createListItemNode()
        $appendInline(li, item)
        list.append(li)
      }
      return list
    }
    const paragraph = $createParagraphNode()
    block.lines.forEach((line, i) => {
      if (i > 0) paragraph.append($createLineBreakNode())
      $appendInline(paragraph, line)
    })
    return paragraph
  })
}

export function $importMarkdownLite(text: string) {
  const root = $getRoot()
  root.clear()
  root.append(...$nodesFromMarkdownLite(text))
  if (root.getChildrenSize() === 0) root.append($createParagraphNode())
}

// Plain text with "- ", "1. " or "# " lines would otherwise paste as paragraphs, yet be saved and shown
// to residents as lists and headings
export const MARKDOWN_LITE_LINE = /^\s*([-*]\s|\d+[.)]\s|#{1,2}\s)/m

// Only bold survives; line breaks become spaces where a new line would end the block (headings, list items)
function inline(node: ElementNode, keepLineBreaks: boolean): string {
  let out = ''
  for (const child of node.getChildren()) {
    if ($isTextNode(child)) {
      const text = child.getTextContent()
      out += child.hasFormat('bold') && text.trim() ? `**${text}**` : text
    } else if ($isLineBreakNode(child)) {
      out += keepLineBreaks ? '\n' : ' '
    } else if ($isElementNode(child) && !$isListNode(child)) {
      out += inline(child, keepLineBreaks)
    }
  }
  return out
}

// Pasted nested lists are flattened: the resident page has no nesting
function listItems(list: ListNode): string[] {
  const items: string[] = []
  for (const child of list.getChildren()) {
    if (!$isListItemNode(child)) continue
    const own = inline(child, false).trim()
    if (own) items.push(own)
    for (const nested of child.getChildren()) {
      if ($isListNode(nested)) items.push(...listItems(nested))
    }
  }
  return items
}

function block(node: LexicalNode): string {
  if ($isHeadingNode(node)) {
    const text = inline(node, false).trim()
    return text ? `${node.getTag() === 'h1' ? '#' : '##'} ${text}` : ''
  }
  if ($isListNode(node)) {
    const ordered = node.getListType() === 'number'
    return listItems(node).map((item, i) => (ordered ? `${i + 1}. ${item}` : `- ${item}`)).join('\n')
  }
  if ($isElementNode(node)) return inline(node, true).split('\n').map(l => l.trim()).join('\n').trim()
  return node.getTextContent().trim()
}

export function $exportMarkdownLite(): string {
  return $getRoot().getChildren().map(block).filter(Boolean).join('\n\n')
}

// For the typing shortcuts only ("- ", "1. ", "# ", "**"): two heading levels, like the resident page
const HEADING_1_2: ElementTransformer = { ...HEADING, regExp: /^(#{1,2})\s/ }
export const SHORTCUT_TRANSFORMERS: Transformer[] = [HEADING_1_2, UNORDERED_LIST, ORDERED_LIST, BOLD_STAR]
