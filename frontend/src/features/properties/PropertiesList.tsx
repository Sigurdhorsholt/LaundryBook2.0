import { useState } from 'react'
import { useGetMyPropertiesQuery } from './propertiesApi'
import { CreatePropertyModal } from './CreatePropertyModal'
import { InviteUserModal } from '../users/InviteUserModal'
import { ADMIN_ROLE_OPTIONS } from '../../shared/constants'
import { colors } from '../../shared/theme'

export function PropertiesList() {
  const { data: properties = [], isLoading } = useGetMyPropertiesQuery()
  const [showCreate, setShowCreate] = useState(false)
  const [invitePropertyId, setInvitePropertyId] = useState<string | null>(null)

  function handleCreated(propertyId: string) {
    setShowCreate(false)
    setInvitePropertyId(propertyId)
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 style={{ fontSize: '1rem', fontWeight: 600, color: colors.textPrimary, margin: 0 }}>
          Ejendomme
        </h2>
        <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}>
          + Opret ejendom
        </button>
      </div>

      {isLoading && (
        <p style={{ color: colors.textSecondary, fontSize: '0.9rem' }}>Henter...</p>
      )}

      {!isLoading && properties.length === 0 && (
        <p style={{ color: colors.textSecondary, fontSize: '0.9rem' }}>Ingen ejendomme endnu.</p>
      )}

      {properties.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {properties.map((p) => (
            <div
              key={p.id}
              className="rounded-3 p-3 d-flex justify-content-between align-items-center"
              style={{ border: `1px solid ${colors.borderDefault}`, backgroundColor: colors.bgCard }}
            >
              <div>
                <p className="fw-semibold mb-0" style={{ color: colors.textPrimary, fontSize: '0.9rem' }}>{p.name}</p>
                <p className="mb-0" style={{ color: colors.textSecondary, fontSize: '0.8rem' }}>{p.address}</p>
              </div>
              <div className="d-flex align-items-center gap-3">
                <span style={{ color: colors.textMuted, fontSize: '0.8rem' }}>{p.memberCount} bruger(e)</span>
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => setInvitePropertyId(p.id)}
                >
                  Inviter admin
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <CreatePropertyModal onClose={() => setShowCreate(false)} onCreated={handleCreated} />
      )}

      {invitePropertyId && (
        <InviteUserModal
          propertyId={invitePropertyId}
          onClose={() => setInvitePropertyId(null)}
          roleOptions={ADMIN_ROLE_OPTIONS}
        />
      )}
    </>
  )
}
