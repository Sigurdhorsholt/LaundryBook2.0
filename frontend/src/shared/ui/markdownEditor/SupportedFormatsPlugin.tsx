import { useEffect } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { mergeRegister } from '@lexical/utils'
import {
  $getRoot, $getSelection, $isRangeSelection, $isRootOrShadowRoot, COMMAND_PRIORITY_HIGH, FORMAT_TEXT_COMMAND,
  PASTE_COMMAND, TextNode, type LexicalNode,
} from 'lexical'
import { $createHeadingNode, HeadingNode } from '@lexical/rich-text'
import { $nodesFromMarkdownLite, MARKDOWN_LITE_LINE } from './markdownLiteLexical'

// The resident page shows two heading levels and bold only. Anything else (Ctrl+I, pasted italics,
// an h3 from Word) is dropped here, so the editor never shows formatting that won't be saved.
export function SupportedFormatsPlugin() {
  const [editor] = useLexicalComposerContext()

  useEffect(() => mergeRegister(
    editor.registerCommand(FORMAT_TEXT_COMMAND, format => format !== 'bold', COMMAND_PRIORITY_HIGH),
    editor.registerCommand(PASTE_COMMAND, event => {
      const data = 'clipboardData' in event ? event.clipboardData : null
      if (!data || data.types.includes('text/html')) return false
      const text = data.getData('text/plain')
      if (!MARKDOWN_LITE_LINE.test(text)) return false
      event.preventDefault()
      editor.update(() => {
        const selection = $getSelection()
        const nodes = $nodesFromMarkdownLite(text)
        if (!$isRangeSelection(selection) || nodes.length === 0) return
        // Whole blocks: a pasted heading must not merge into the line the caret is on
        const anchor = selection.anchor.getNode()
        const current = $isRootOrShadowRoot(anchor) ? null : anchor.getTopLevelElementOrThrow()
        if (!current) {
          $getRoot().append(...nodes)
        } else {
          let after: LexicalNode = current
          for (const node of nodes) {
            after.insertAfter(node)
            after = node
          }
          if (current.getTextContent().trim() === '') current.remove()
        }
        nodes[nodes.length - 1]!.selectEnd()
      })
      return true
    }, COMMAND_PRIORITY_HIGH),
    editor.registerNodeTransform(TextNode, node => {
      const bold = node.hasFormat('bold')
      if (node.getFormat() !== (bold ? 1 : 0)) node.setFormat(bold ? 'bold' : 0)
    }),
    editor.registerNodeTransform(HeadingNode, node => {
      if (node.getTag() !== 'h1' && node.getTag() !== 'h2') node.replace($createHeadingNode('h2'), true)
    }),
  ), [editor])

  return null
}
