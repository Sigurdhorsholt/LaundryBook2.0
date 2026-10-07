import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { HeadingNode } from '@lexical/rich-text'
import { ListItemNode, ListNode } from '@lexical/list'
import { MarkdownEditorToolbar } from './MarkdownEditorToolbar'
import { SupportedFormatsPlugin } from './SupportedFormatsPlugin'
import { $exportMarkdownLite, $importMarkdownLite, SHORTCUT_TRANSFORMERS } from './markdownLiteLexical'

interface Props {
  // Read once on mount; give the editor a new key to load different text
  initialText: string
  labelledBy: string
  placeholder: string
  onChange: (text: string) => void
}

const theme = {
  text: { bold: 'md-editor-bold' },
}

// Rich-text editing of markdown-lite text: headings, bold and lists, the same things MarkdownLite renders
export function MarkdownEditor({ initialText, labelledBy, placeholder, onChange }: Props) {
  const initialConfig = {
    namespace: 'MarkdownEditor',
    theme,
    nodes: [HeadingNode, ListNode, ListItemNode],
    editorState: () => $importMarkdownLite(initialText),
    onError: (error: Error) => { throw error },
  }

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <MarkdownEditorToolbar />
      <div className="md-editor">
        <RichTextPlugin
          contentEditable={<ContentEditable className="md-editor-content" aria-labelledby={labelledBy} aria-multiline />}
          placeholder={<div className="md-editor-placeholder">{placeholder}</div>}
          ErrorBoundary={LexicalErrorBoundary}
        />
      </div>
      <HistoryPlugin />
      <ListPlugin />
      <MarkdownShortcutPlugin transformers={SHORTCUT_TRANSFORMERS} />
      <SupportedFormatsPlugin />
      <OnChangePlugin ignoreSelectionChange onChange={state => onChange(state.read($exportMarkdownLite))} />
    </LexicalComposer>
  )
}
