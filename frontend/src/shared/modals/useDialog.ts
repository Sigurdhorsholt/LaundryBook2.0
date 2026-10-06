import { useEffect, useRef, useState, type RefObject } from 'react'

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

// Dialog keyboard behaviour shared by every modal: Escape closes (unless closing is blocked, e.g.
// while a request runs), Tab stays inside, focus moves in on open and back to the trigger on close.
export function useDialog(dialogRef: RefObject<HTMLElement | null>, onClose: () => void, closable = true) {
  // Captured during the first render: by the time effects run, an autoFocus field inside the dialog
  // has already taken focus and the trigger would be lost.
  const [returnFocusTo] = useState(() => (document.activeElement instanceof HTMLElement ? document.activeElement : null))
  const onCloseRef = useRef(onClose)
  const closableRef = useRef(closable)
  useEffect(() => {
    onCloseRef.current = onClose
    closableRef.current = closable
  })

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const focusables = () => [...dialog.querySelectorAll<HTMLElement>(FOCUSABLE)]

    // Forms start in their first field; confirm dialogs focus the dialog itself so Enter can't
    // accidentally confirm, while screen readers still announce the title.
    const firstField = dialog.querySelector<HTMLElement>('input:not([disabled]), select:not([disabled]), textarea:not([disabled])')
    ;(firstField ?? dialog).focus()

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        if (closableRef.current) onCloseRef.current()
        return
      }
      if (e.key !== 'Tab') return
      const items = focusables()
      if (items.length === 0) {
        e.preventDefault()
        return
      }
      const first = items[0]!
      const last = items[items.length - 1]!
      if (e.shiftKey && (document.activeElement === first || document.activeElement === dialog)) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      returnFocusTo?.focus()
    }
  }, [dialogRef, returnFocusTo])
}
