import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
// The same module main.tsx loads, so this is the one Bootstrap instance, not a second copy
import bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js'

export function cleanupBootstrapOverlays() {
  document.querySelectorAll('.offcanvas-backdrop').forEach(el => el.remove())
  if (!document.querySelector('.offcanvas.show, .modal.show')) {
    document.body.classList.remove('modal-open')
    document.body.style.removeProperty('overflow')
    document.body.style.removeProperty('padding-right')
  }
}

// An open Bootstrap offcanvas traps focus: whatever takes focus outside it, such as a modal's input,
// is pulled straight back, so on a phone the keyboard never opens. Close it first, then open the modal.
export function closeOffcanvasThen(elementId: string, then: () => void) {
  const el = document.getElementById(elementId)
  if (!el?.classList.contains('show')) {
    then()
    return
  }
  el.addEventListener('hidden.bs.offcanvas', then, { once: true })
  bootstrap.Offcanvas.getOrCreateInstance(el).hide()
}

/**
 * Closes a Bootstrap offcanvas panel whenever the route changes, and cleans up
 * the backdrop+body lock when the component unmounts.
 */
export function useOffcanvasAutoClose(elementId: string) {
  const location = useLocation()

  useEffect(() => {
    const el = document.getElementById(elementId)
    if (!el || !el.classList.contains('show')) return
    bootstrap.Offcanvas.getOrCreateInstance(el).hide()
    // Fallback: Bootstrap sometimes fails to clean up when hide() is triggered mid-animation
    const timer = setTimeout(cleanupBootstrapOverlays, 350)
    return () => clearTimeout(timer)
  }, [location.pathname, elementId])

  // Run cleanup when the component unmounts so the backdrop doesn't persist
  useEffect(() => {
    return cleanupBootstrapOverlays
  }, [])
}
