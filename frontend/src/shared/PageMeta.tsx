import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { SITE_ORIGIN } from './constants'

export type SeoPage = 'home' | 'features' | 'demo' | 'faq' | 'about' | 'getStarted' | 'privacy' | 'terms'

// Per-page <title>, description and canonical for the public pages. Set imperatively and restored on
// unmount so the static defaults in index.html stay in place for every other page (and for scrapers
// that don't run JS) without ever having two <title> or canonical tags in the document.
export function PageMeta({ page }: { page: SeoPage }) {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const title = t(`seo.${page}.title`)
  const description = t(`seo.${page}.description`)

  useEffect(() => {
    const previousTitle = document.title
    const descriptionTag = document.querySelector('meta[name="description"]')
    const previousDescription = descriptionTag?.getAttribute('content') ?? null

    document.title = title
    descriptionTag?.setAttribute('content', description)

    const canonical = document.createElement('link')
    canonical.rel = 'canonical'
    canonical.href = SITE_ORIGIN + pathname
    document.head.appendChild(canonical)

    return () => {
      document.title = previousTitle
      if (previousDescription !== null) descriptionTag?.setAttribute('content', previousDescription)
      canonical.remove()
    }
  }, [title, description, pathname])

  return null
}
