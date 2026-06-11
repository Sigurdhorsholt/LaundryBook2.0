import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export function cleanupBootstrapOverlays() {
  document.querySelectorAll('.offcanvas-backdrop').forEach(el => el.remove())
  if (!document.querySelector('.offcanvas.show, .modal.show')) {
    document.body.classList.remove('modal-open')
    document.body.style.removeProperty('overflow')
    document.body.style.removeProperty('padding-right')
  }
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const BS = (window as any).bootstrap
    if (!BS?.Offcanvas) return
    const instance = BS.Offcanvas.getInstance(el) ?? new BS.Offcanvas(el)
    instance.hide()
    // Fallback: Bootstrap sometimes fails to clean up when hide() is triggered mid-animation
    const timer = setTimeout(cleanupBootstrapOverlays, 350)
    return () => clearTimeout(timer)
  }, [location.pathname, elementId])

  // Run cleanup when the component unmounts so the backdrop doesn't persist
  useEffect(() => {
    return cleanupBootstrapOverlays
  }, [])
}
