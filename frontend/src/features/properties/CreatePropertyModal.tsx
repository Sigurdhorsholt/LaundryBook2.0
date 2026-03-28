import { useState } from 'react'
import { ModalShell } from '../../shared/modals/ModalShell'
import { useCreatePropertyMutation } from './propertiesApi'
import { colors } from '../../shared/theme'

interface CreatePropertyModalProps {
  onClose: () => void
  onCreated: (propertyId: string) => void
}

export function CreatePropertyModal({ onClose, onCreated }: CreatePropertyModalProps) {
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [createProperty, { isLoading }] = useCreatePropertyMutation()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      const result = await createProperty({ name, address }).unwrap()
      onCreated(result.id)
    } catch {
      setError('Noget gik galt. Prøv igen.')
    }
  }

  return (
    <ModalShell title="Opret ejendom" onClose={onClose}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 500, color: colors.textPrimary }}>
            Navn
          </label>
          <input
            className="form-control"
            type="text"
            placeholder="Ejendomsnavn"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={200}
            autoFocus
          />
        </div>
        <div>
          <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 500, color: colors.textPrimary }}>
            Adresse
          </label>
          <input
            className="form-control"
            type="text"
            placeholder="Gade 1, 2100 København"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
            maxLength={500}
          />
        </div>
        {error && <p style={{ color: colors.dangerText, margin: 0, fontSize: 14 }}>{error}</p>}
        <button className="btn btn-primary fw-semibold" type="submit" disabled={isLoading}>
          {isLoading ? 'Opretter…' : 'Opret ejendom'}
        </button>
      </form>
    </ModalShell>
  )
}
