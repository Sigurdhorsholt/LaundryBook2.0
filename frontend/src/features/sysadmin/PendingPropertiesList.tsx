import { useGetPendingPropertiesQuery, useActivatePropertyMutation } from './sysAdminApi'
import { colors } from '../../shared/theme'

export function PendingPropertiesList() {
  const { data: pending = [], isLoading } = useGetPendingPropertiesQuery()
  const [activate, { isLoading: isActivating }] = useActivatePropertyMutation()

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 style={{ fontSize: '1rem', fontWeight: 600, color: colors.textPrimary, margin: 0 }}>
          Afventer godkendelse
        </h2>
        {pending.length > 0 && (
          <span className="badge" style={{ backgroundColor: colors.primaryLight, color: colors.primary, fontWeight: 600 }}>
            {pending.length}
          </span>
        )}
      </div>

      {isLoading && <p style={{ color: colors.textSecondary, fontSize: '0.9rem' }}>Henter...</p>}

      {!isLoading && pending.length === 0 && (
        <p style={{ color: colors.textSecondary, fontSize: '0.9rem', margin: 0 }}>
          Ingen foreninger afventer godkendelse.
        </p>
      )}

      {pending.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {pending.map((p) => (
            <div
              key={p.id}
              className="rounded-3 p-3 d-flex justify-content-between align-items-center gap-3 flex-wrap"
              style={{ border: `1px solid ${colors.borderDefault}`, backgroundColor: colors.bgCard }}
            >
              <div style={{ minWidth: 0 }}>
                <p className="fw-semibold mb-0" style={{ color: colors.textPrimary, fontSize: '0.9rem' }}>{p.name}</p>
                <p className="mb-0" style={{ color: colors.textSecondary, fontSize: '0.8rem' }}>{p.address}</p>
                <p className="mb-0 mt-1" style={{ color: colors.textMuted, fontSize: '0.78rem' }}>
                  {p.adminName ?? 'Ukendt'}{p.adminEmail ? ` · ${p.adminEmail}` : ''} · oprettet {new Date(p.createdAt).toLocaleDateString('da-DK')}
                </p>
              </div>
              <button
                className="btn btn-primary btn-sm"
                disabled={isActivating}
                onClick={() => activate(p.id)}
              >
                {isActivating ? 'Aktiverer…' : 'Aktivér'}
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
