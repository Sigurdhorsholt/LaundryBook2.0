type RtkError = { status?: number | string; data?: { title?: string; errors?: Record<string, string[]> } }

export function extractErrorMessage(err: unknown, fallback: string): string {
  if (typeof err === 'object' && err !== null && 'data' in err) {
    const { status, data } = err as RtkError
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
