import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useGetAllInvitesQuery, type SystemInviteStatus } from './sysAdminApi'
import { SystemInviteRow } from './SystemInviteRow'
import { INVITES_EMPTY_KEY, SYSTEM_TABLE_HEAD } from './constants'
import { Notice, SegmentedControl } from '../../shared/ui'
import { colors } from '../../shared/theme'

// Unused invites on every property, so a SysAdmin can chase or clean them up
export function AllInvitesTable() {
  const { t } = useTranslation()
  const searchId = useId()
  const [status, setStatus] = useState<SystemInviteStatus>('Pending')
  const [search, setSearch] = useState('')
  const [resentTo, setResentTo] = useState<string | null>(null)
  // currentData, not data: while another filter loads, the previous filter's rows must not show
  const { currentData: invites = [], isFetching } = useGetAllInvitesQuery(status)
  const q = search.trim().toLowerCase()
  const shown = q
    ? invites.filter(i => `${i.email ?? ''} ${i.propertyName} ${i.createdBy ?? ''}`.toLowerCase().includes(q))
    : invites

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h2 style={{ fontSize: '1rem', fontWeight: 600, color: colors.textPrimary, margin: 0 }}>
          {t('sysadmin.invites.title')} <span style={{ color: colors.textMuted, fontWeight: 500 }}>({invites.length})</span>
        </h2>
        <div className="d-flex flex-wrap gap-2">
          <SegmentedControl<SystemInviteStatus>
            segments={[
              { value: 'Pending', label: t('sysadmin.invites.statusPending') },
              { value: 'Expired', label: t('sysadmin.invites.statusExpired') },
              { value: 'SharedLink', label: t('sysadmin.invites.statusShared') },
            ]}
            value={status}
            onChange={setStatus}
          />
          <label htmlFor={searchId} className="visually-hidden">{t('sysadmin.invites.search')}</label>
          <input
            id={searchId}
            type="search"
            className="form-control form-control-sm"
            style={{ width: 260 }}
            placeholder={t('sysadmin.invites.search')}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {resentTo && <Notice onDismiss={() => setResentTo(null)}>{t('sysadmin.invites.resent', { email: resentTo })}</Notice>}
      {isFetching && invites.length === 0 && <p style={{ color: colors.textSecondary, fontSize: '0.9rem' }}>{t('sysadmin.loading')}</p>}
      {!isFetching && shown.length === 0 && (
        <p style={{ color: colors.textSecondary, fontSize: '0.9rem', margin: 0 }}>
          {q ? t('sysadmin.invites.noMatch') : t(INVITES_EMPTY_KEY[status])}
        </p>
      )}

      {shown.length > 0 && (
        <div style={{ overflowX: 'auto', border: `1px solid ${colors.borderDefault}`, borderRadius: 10 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
            <thead>
              <tr>
                <th scope="col" style={SYSTEM_TABLE_HEAD}>{t('sysadmin.invites.colRecipient')}</th>
                <th scope="col" style={SYSTEM_TABLE_HEAD}>{t('sysadmin.invites.colProperty')}</th>
                <th scope="col" style={SYSTEM_TABLE_HEAD}>{t('sysadmin.invites.colRole')}</th>
                <th scope="col" style={SYSTEM_TABLE_HEAD}>{t('sysadmin.invites.colCreatedBy')}</th>
                <th scope="col" style={SYSTEM_TABLE_HEAD}>{t('sysadmin.invites.colCreated')}</th>
                <th scope="col" style={SYSTEM_TABLE_HEAD}>
                  {status === 'Expired' ? t('sysadmin.invites.colExpired') : t('sysadmin.invites.colExpires')}
                </th>
                <th scope="col" style={SYSTEM_TABLE_HEAD}><span className="visually-hidden">{t('sysadmin.invites.colActions')}</span></th>
              </tr>
            </thead>
            <tbody>
              {shown.map(i => <SystemInviteRow key={i.id} invite={i} status={status} onResent={setResentTo} />)}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
