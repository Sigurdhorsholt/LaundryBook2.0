import { useState, useEffect } from 'react'
import { useGetAllUsersQuery } from './sysAdminApi'
import type { SysAdminUserDto } from './sysAdminApi'
import { ManageUserMembershipsModal } from './ManageUserMembershipsModal'
import { colors } from '../../shared/theme'

const PAGE_SIZE = 10

export function UserTable() {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [managingUser, setManagingUser] = useState<SysAdminUserDto | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [search])

  const { data, isLoading } = useGetAllUsersQuery({
    search: debouncedSearch || undefined,
    page,
    pageSize: PAGE_SIZE,
  })

  const totalPages = data ? Math.ceil(data.totalCount / PAGE_SIZE) : 1
  const from = data && data.totalCount > 0 ? (page - 1) * PAGE_SIZE + 1 : 0
  const to = data ? Math.min(page * PAGE_SIZE, data.totalCount) : 0

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 style={{ fontSize: '1rem', fontWeight: 600, color: colors.textPrimary, margin: 0 }}>
          Brugere
        </h2>
        <input
          className="form-control form-control-sm"
          style={{ maxWidth: 260 }}
          type="search"
          placeholder="Søg på navn eller e-mail..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="table table-sm mb-0" style={{ fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ backgroundColor: colors.bgHeader }}>
              <th style={{ color: colors.textSecondary, fontWeight: 500, borderBottom: `1px solid ${colors.borderDefault}` }}>Navn</th>
              <th style={{ color: colors.textSecondary, fontWeight: 500, borderBottom: `1px solid ${colors.borderDefault}` }}>E-mail</th>
              <th style={{ color: colors.textSecondary, fontWeight: 500, borderBottom: `1px solid ${colors.borderDefault}` }}>Ejendomme</th>
              <th style={{ borderBottom: `1px solid ${colors.borderDefault}` }} />
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={4} style={{ color: colors.textSecondary, textAlign: 'center', padding: '20px 0' }}>
                  Henter...
                </td>
              </tr>
            )}
            {!isLoading && data?.items.length === 0 && (
              <tr>
                <td colSpan={4} style={{ color: colors.textSecondary, textAlign: 'center', padding: '20px 0' }}>
                  Ingen brugere fundet.
                </td>
              </tr>
            )}
            {data?.items.map((u) => (
              <tr key={u.id} style={{ borderBottom: `1px solid ${colors.borderRow}` }}>
                <td style={{ color: colors.textPrimary, fontWeight: 500, verticalAlign: 'middle' }}>
                  {u.firstName} {u.lastName}
                </td>
                <td style={{ color: colors.textSecondary, verticalAlign: 'middle' }}>{u.email}</td>
                <td style={{ color: colors.textMuted, verticalAlign: 'middle' }}>{u.membershipCount}</td>
                <td style={{ textAlign: 'right', verticalAlign: 'middle' }}>
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => setManagingUser(u)}
                  >
                    Administrer adgang
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data && data.totalCount > 0 && (
        <div className="d-flex justify-content-between align-items-center mt-3" style={{ fontSize: '0.8rem', color: colors.textSecondary }}>
          <span>Viser {from}–{to} af {data.totalCount} brugere</span>
          <div className="d-flex gap-2">
            <button
              className="btn btn-sm btn-outline-secondary"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              ← Forrige
            </button>
            <span style={{ lineHeight: '31px' }}>{page} / {totalPages}</span>
            <button
              className="btn btn-sm btn-outline-secondary"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Næste →
            </button>
          </div>
        </div>
      )}

      {managingUser && (
        <ManageUserMembershipsModal user={managingUser} onClose={() => setManagingUser(null)} />
      )}
    </>
  )
}
