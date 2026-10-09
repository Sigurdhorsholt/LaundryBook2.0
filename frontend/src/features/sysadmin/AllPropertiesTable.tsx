import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useGetAllPropertiesQuery } from './sysAdminApi'
import { SystemPropertyRow } from './SystemPropertyRow'
import { CreatePropertyModal } from '../properties/CreatePropertyModal'
import { InviteUserModal } from '../users/InviteUserModal'
import { useAdminRoleOptions } from '../../shared/constants'
import { colors } from '../../shared/theme'

const head: React.CSSProperties = {
  padding: '8px 12px', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
  color: colors.textMuted, backgroundColor: colors.bgHeader, whiteSpace: 'nowrap',
}

// Every property on the platform, including ones the SysAdmin isn't a member of
export function AllPropertiesTable() {
  const { t } = useTranslation()
  const searchId = useId()
  const adminRoleOptions = useAdminRoleOptions()
  const { data: properties = [], isLoading } = useGetAllPropertiesQuery()
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [invitePropertyId, setInvitePropertyId] = useState<string | null>(null)
  const q = search.trim().toLowerCase()
  const shown = q ? properties.filter(p => `${p.name} ${p.address}`.toLowerCase().includes(q)) : properties

  function handleCreated(propertyId: string) {
    setShowCreate(false)
    setInvitePropertyId(propertyId)
  }

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h2 style={{ fontSize: '1rem', fontWeight: 600, color: colors.textPrimary, margin: 0 }}>
          {t('sysadmin.allProperties.title')} <span style={{ color: colors.textMuted, fontWeight: 500 }}>({properties.length})</span>
        </h2>
        <div className="d-flex flex-wrap gap-2">
          <label htmlFor={searchId} className="visually-hidden">{t('sysadmin.allProperties.search')}</label>
          <input
            id={searchId}
            type="search"
            className="form-control form-control-sm"
            style={{ width: 260 }}
            placeholder={t('sysadmin.allProperties.search')}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button type="button" className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}>
            + {t('properties.createProperty')}
          </button>
        </div>
      </div>

      {isLoading && <p style={{ color: colors.textSecondary, fontSize: '0.9rem' }}>{t('sysadmin.loading')}</p>}
      {!isLoading && shown.length === 0 && (
        <p style={{ color: colors.textSecondary, fontSize: '0.9rem', margin: 0 }}>
          {q ? t('sysadmin.allProperties.noMatch') : t('properties.noPropertiesYet')}
        </p>
      )}

      {shown.length > 0 && (
        <div style={{ overflowX: 'auto', border: `1px solid ${colors.borderDefault}`, borderRadius: 10 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 940 }}>
            <thead>
              <tr>
                <th scope="col" style={head}>{t('sysadmin.allProperties.colProperty')}</th>
                <th scope="col" style={head}>{t('sysadmin.allProperties.colStatus')}</th>
                <th scope="col" style={head}>{t('sysadmin.allProperties.colCreated')}</th>
                <th scope="col" style={{ ...head, textAlign: 'right' }}>{t('sysadmin.allProperties.colMembers')}</th>
                <th scope="col" style={{ ...head, textAlign: 'right' }}>{t('sysadmin.allProperties.colRooms')}</th>
                <th scope="col" style={{ ...head, textAlign: 'right' }}>{t('sysadmin.allProperties.colLast30')}</th>
                <th scope="col" style={{ ...head, textAlign: 'right' }}>{t('sysadmin.allProperties.colNext7')}</th>
                <th scope="col" style={head}><span className="visually-hidden">{t('sysadmin.allProperties.colActions')}</span></th>
              </tr>
            </thead>
            <tbody>
              {shown.map(p => <SystemPropertyRow key={p.id} property={p} onInviteAdmin={setInvitePropertyId} />)}
            </tbody>
          </table>
        </div>
      )}

      {showCreate && <CreatePropertyModal onClose={() => setShowCreate(false)} onCreated={handleCreated} />}
      {invitePropertyId && (
        <InviteUserModal propertyId={invitePropertyId} onClose={() => setInvitePropertyId(null)} roleOptions={adminRoleOptions} />
      )}
    </>
  )
}
