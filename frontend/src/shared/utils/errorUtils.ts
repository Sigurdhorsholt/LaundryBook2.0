import i18n from '../../i18n'

type RtkError = {
  status?: number | string
  data?: { title?: string; code?: string; params?: Record<string, unknown>; errors?: Record<string, string[]> }
}

// Error codes arrive as runtime strings, so they can't be checked against the typed key union
const translate = i18n.t as (key: string, options?: Record<string, unknown>) => string

export function extractErrorMessage(err: unknown, fallback: string): string {
  if (typeof err === 'object' && err !== null && 'data' in err) {
    const { status, data } = err as RtkError
    // A known code wins: it follows the user's language, while the server's title is Danish only
    const key = data?.code ? `errors.${data.code}` : null
    const params = data?.params ?? {}
    if (key && i18n.exists(key, params)) return translate(key, params)
    // 422s carry the readable messages per field; the title is just "Validation failed"
    const firstFieldError = data?.errors ? Object.values(data.errors).flat()[0] : undefined
    if (firstFieldError) return firstFieldError
    // 5xx titles are generic English server text; the caller's translated fallback says the same
    if (typeof status === 'number' && status >= 500) return fallback
    if (data?.title) return data.title
  }
  if (err instanceof Error) return err.message
  return fallback
}
