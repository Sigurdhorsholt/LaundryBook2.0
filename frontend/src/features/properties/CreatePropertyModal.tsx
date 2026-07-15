import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ModalShell } from '../../shared/modals/ModalShell'
import { useCreatePropertyMutation } from './propertiesApi'
import { colors } from '../../shared/theme'

interface CreatePropertyModalProps {
  onClose: () => void
  onCreated: (propertyId: string) => void
}

export function CreatePropertyModal({ onClose, onCreated }: CreatePropertyModalProps) {
  const { t } = useTranslation()
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
      setError(t('properties.createFailed'))
    }
  }

  return (
    <ModalShell title={t('properties.createProperty')} onClose={onClose}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 500, color: colors.textPrimary }}>
            {t('properties.name')}
          </label>
          <input
            className="form-control"
            type="text"
            placeholder={t('properties.namePlaceholder')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={200}
            autoFocus
          />
        </div>
        <div>
          <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 500, color: colors.textPrimary }}>
            {t('properties.address')}
          </label>
          <input
            className="form-control"
            type="text"
            placeholder={t('properties.addressPlaceholder')}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
            maxLength={500}
          />
        </div>
        {error && <p style={{ color: colors.dangerText, margin: 0, fontSize: 14 }}>{error}</p>}
        <button className="btn btn-primary fw-semibold" type="submit" disabled={isLoading}>
          {isLoading ? t('properties.creating') : t('properties.createProperty')}
        </button>
      </form>
    </ModalShell>
  )
}
