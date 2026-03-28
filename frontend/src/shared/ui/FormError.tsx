interface FormErrorProps {
  message: string | null | undefined
}

export function FormError({ message }: FormErrorProps) {
  if (!message) return null
  return (
    <p className="mb-2" style={{ fontSize: '0.85rem', color: '#dc3545' }}>
      {message}
    </p>
  )
}
