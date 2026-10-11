// The public site and the app are the same build on two hosts (#158). Without both URLs set
// (local dev, *.onrender.com, previews) there is one host that serves everything.
const SITE_URL = (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, '')
const APP_URL = (import.meta.env.VITE_APP_URL as string | undefined)?.replace(/\/$/, '')

export type HostRole = 'site' | 'app' | 'both'

const bare = (host: string) => host.replace(/^www\./, '')

// www and the apex both count as the site
export function hostRole(host = window.location.host): HostRole {
  if (!SITE_URL || !APP_URL) return 'both'
  if (host === new URL(APP_URL).host) return 'app'
  if (bare(host) === bare(new URL(SITE_URL).host)) return 'site'
  return 'both'
}

export function hostUrl(role: 'site' | 'app', path: string): string {
  const base = role === 'site' ? SITE_URL : APP_URL
  return hostRole() === 'both' || !base ? path : `${base}${path}`
}

// Only the app is installable; on the site the manifest would turn the marketing pages into a half-working app
export function linkAppManifest() {
  if (hostRole() === 'site') return
  const link = document.createElement('link')
  link.rel = 'manifest'
  link.href = '/manifest.webmanifest'
  document.head.appendChild(link)
}
