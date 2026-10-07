import { useLayoutEffect, useRef } from 'react'

interface Props {
  // The width the content is laid out at; it's scaled down to whatever room the column has
  designWidth: number
  children: React.ReactNode
}

// Styles are written straight to the DOM: it's a pure layout measurement, and going through state
// would render twice on every resize
export function ScaledToFit({ designWidth, children }: Props) {
  const outer = useRef<HTMLDivElement>(null)
  const inner = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const o = outer.current
    const i = inner.current
    if (!o || !i) return
    function update() {
      if (!o || !i) return
      const scale = Math.min(1, o.clientWidth / designWidth)
      i.style.transform = `scale(${scale})`
      o.style.height = `${i.offsetHeight * scale}px`
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(o)
    observer.observe(i)
    return () => observer.disconnect()
  }, [designWidth])

  return (
    <div ref={outer} style={{ width: '100%', overflow: 'hidden' }}>
      <div ref={inner} style={{ width: designWidth, transformOrigin: 'top left' }}>
        {children}
      </div>
    </div>
  )
}
