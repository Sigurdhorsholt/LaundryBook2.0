interface SpinnerProps {
  /** Centers the spinner in a full-page-height container */
  fullPage?: boolean
}

export function Spinner({ fullPage = false }: SpinnerProps) {
  const spinner = <div className="spinner-border text-primary spinner-border-sm" role="status" />

  if (fullPage) {
    return (
      <div
        className="p-4 p-lg-5 d-flex justify-content-center align-items-center"
        style={{ minHeight: 300 }}
      >
        {spinner}
      </div>
    )
  }

  return (
    <div className="d-flex justify-content-center py-4">
      {spinner}
    </div>
  )
}
