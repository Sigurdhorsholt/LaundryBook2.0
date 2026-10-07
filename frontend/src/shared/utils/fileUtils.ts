export function downloadTextFile(fileName: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  a.click()
  // Safari can still be reading the blob after click() returns, e.g. while it offers to add a calendar event
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}
