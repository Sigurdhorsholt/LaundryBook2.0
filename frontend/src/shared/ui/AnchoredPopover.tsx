import { useEffect, useLayoutEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { colors } from '../theme'

interface Props {
  anchor: HTMLElement
  labelledBy: string
  width?: number
  onClose: () => void
  children: React.ReactNode
}

const GAP = 8
const MARGIN = 8
const FOCUSABLE = 'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled])'

// Beside the anchor (right if it fits, otherwise left), top-aligned, and always inside the viewport
function place(el: HTMLElement, anchor: HTMLElement) {
  const a = anchor.getBoundingClientRect()
  // Layout size, not the bounding box, which the opening scale animation shrinks
  const width = el.offsetWidth
  const height = el.offsetHeight
  const vw = document.documentElement.clientWidth
  const vh = window.innerHeight
  let left = a.right + GAP
  if (left + width > vw - MARGIN) left = a.left - GAP - width
  left = Math.max(MARGIN, Math.min(left, vw - MARGIN - width))
  const top = Math.max(MARGIN, Math.min(a.top, vh - MARGIN - height))
  el.style.left = `${left}px`
  el.style.top = `${top}px`
}

// Portalled to <body> because the week grid scrolls sideways and would clip it
export function AnchoredPopover({ anchor, labelledBy, width = 300, onClose, children }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  })

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    function update() {
      // A refetch or a week change can re-render the cell away underneath the popover
      if (!anchor.isConnected) onCloseRef.current()
      else if (el) place(el, anchor)
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    window.addEventListener('scroll', update, true)
    window.addEventListener('resize', update)
    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', update, true)
      window.removeEventListener('resize', update)
    }
  }, [anchor])

  useLayoutEffect(() => {
    const el = ref.current
    el?.focus()
    // Runs before the popover leaves the DOM, so focus that was inside it goes back to the cell
    return () => {
      if (el?.contains(document.activeElement) && anchor.isConnected) anchor.focus()
    }
  }, [anchor])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onCloseRef.current()
    }
    function onPointer(e: PointerEvent) {
      const target = e.target as Node
      // The anchor toggles the popover itself
      if (ref.current?.contains(target) || anchor.contains(target)) return
      onCloseRef.current()
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointer)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointer)
    }
  }, [anchor])

  function keepTabInside(e: React.KeyboardEvent) {
    if (e.key !== 'Tab' || !ref.current) return
    const items = ref.current.querySelectorAll<HTMLElement>(FOCUSABLE)
    if (items.length === 0) return
    const first = items[0]
    const last = items[items.length - 1]
    const active = document.activeElement
    if (e.shiftKey && (active === first || active === ref.current)) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && active === last) {
      e.preventDefault()
      first.focus()
    }
  }

  return createPortal(
    <div
      ref={ref}
      role="dialog"
      aria-labelledby={labelledBy}
      tabIndex={-1}
      onKeyDown={keepTabInside}
      className="anchored-popover"
      style={{
        position: 'fixed', zIndex: 1050, width, maxWidth: `calc(100vw - ${MARGIN * 2}px)`,
        maxHeight: `calc(100vh - ${MARGIN * 2}px)`, overflowY: 'auto', boxSizing: 'border-box',
        backgroundColor: colors.bgCard, border: `1px solid ${colors.borderDefault}`, borderRadius: 12,
        boxShadow: '0 14px 36px rgba(18,32,26,0.24)', padding: '14px 16px', outline: 'none',
      }}
    >
      {children}
    </div>,
    document.body,
  )
}
