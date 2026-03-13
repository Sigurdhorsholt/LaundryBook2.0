/**
 * Feature flags — toggle modules on/off without touching routes.
 * Set a flag to `false` to hide the route entirely (renders 404 instead).
 */
export const FEATURES = {
  laundryBooking: true,
  resourceBooking: false,
  residentsDirectory: false,
  announcements: false,
  issueReporting: false,
  documentStorage: false,
} as const

export type FeatureKey = keyof typeof FEATURES

export function isEnabled(key: FeatureKey): boolean {
  return FEATURES[key]
}
