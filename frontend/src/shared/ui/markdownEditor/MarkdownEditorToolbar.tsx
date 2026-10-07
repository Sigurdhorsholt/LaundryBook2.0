import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { mergeRegister, $getNearestNodeOfType } from '@lexical/utils'
import { $setBlocksType } from '@lexical/selection'
import { $createHeadingNode, $isHeadingNode } from '@lexical/rich-text'
import { INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND, REMOVE_LIST_COMMAND, ListNode } from '@lexical/list'
import {
  $createParagraphNode, $getSelection, $isRangeSelection, $isRootOrShadowRoot, CAN_REDO_COMMAND, CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_LOW, FORMAT_TEXT_COMMAND, REDO_COMMAND, UNDO_COMMAND,
} from 'lexical'

type Block = 'paragraph' | 'h1' | 'h2' | 'bullet' | 'number'

export function MarkdownEditorToolbar() {
  const { t } = useTranslation()
  const [editor] = useLexicalComposerContext()
  const [block, setBlock] = useState<Block>('paragraph')
  const [bold, setBold] = useState(false)
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)

  useEffect(() => mergeRegister(
    editor.registerUpdateListener(({ editorState }) => editorState.read(() => {
      const selection = $getSelection()
      if (!$isRangeSelection(selection)) return
      const anchor = selection.anchor.getNode()
      const top = $isRootOrShadowRoot(anchor) ? anchor : anchor.getTopLevelElementOrThrow()
      const list = $getNearestNodeOfType(anchor, ListNode)
      setBlock(list ? (list.getListType() === 'number' ? 'number' : 'bullet')
        : $isHeadingNode(top) && (top.getTag() === 'h1' || top.getTag() === 'h2') ? top.getTag() as Block
        : 'paragraph')
      setBold(selection.hasFormat('bold'))
    })),
    editor.registerCommand(CAN_UNDO_COMMAND, v => { setCanUndo(v); return false }, COMMAND_PRIORITY_LOW),
    editor.registerCommand(CAN_REDO_COMMAND, v => { setCanRedo(v); return false }, COMMAND_PRIORITY_LOW),
  ), [editor])

  function setHeading(tag: 'h1' | 'h2') {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) $setBlocksType(selection, () => (block === tag ? $createParagraphNode() : $createHeadingNode(tag)))
    })
  }

  function setList(type: 'bullet' | 'number') {
    if (block === type) editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined)
    else editor.dispatchCommand(type === 'bullet' ? INSERT_UNORDERED_LIST_COMMAND : INSERT_ORDERED_LIST_COMMAND, undefined)
  }

  const button = (pressed: boolean) => `btn btn-sm btn-outline-secondary${pressed ? ' active' : ''}`

  return (
    <div role="toolbar" aria-label={t('markdownEditor.toolbar')} className="d-flex flex-wrap gap-1 mb-2">
      <button type="button" className={button(block === 'h1')} aria-pressed={block === 'h1'} onClick={() => setHeading('h1')}>
        {t('markdownEditor.heading')}
      </button>
      <button type="button" className={button(block === 'h2')} aria-pressed={block === 'h2'} onClick={() => setHeading('h2')}>
        {t('markdownEditor.subheading')}
      </button>
      <button type="button" className={button(bold)} aria-pressed={bold} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')} style={{ fontWeight: 700 }}>
        {t('markdownEditor.bold')}
      </button>
      <button type="button" className={button(block === 'bullet')} aria-pressed={block === 'bullet'} onClick={() => setList('bullet')}>
        {t('markdownEditor.bulletList')}
      </button>
      <button type="button" className={button(block === 'number')} aria-pressed={block === 'number'} onClick={() => setList('number')}>
        {t('markdownEditor.numberedList')}
      </button>
      <span className="d-flex gap-1 ms-auto">
        <button type="button" className={button(false)} disabled={!canUndo} aria-label={t('markdownEditor.undo')} title={t('markdownEditor.undo')} onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}>
          ↶
        </button>
        <button type="button" className={button(false)} disabled={!canRedo} aria-label={t('markdownEditor.redo')} title={t('markdownEditor.redo')} onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}>
          ↷
        </button>
      </span>
    </div>
  )
}
