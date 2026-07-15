type RtkError = { data?: { title?: string } }

export function extractErrorMessage(err: unknown, fallback: string): string {
  if (typeof err === 'object' && err !== null && 'data' in err) {
    const rtkErr = err as RtkError
    if (rtkErr.data?.title) return rtkErr.data.title
  }
  if (err instanceof Error) return err.message
  return fallback
}
