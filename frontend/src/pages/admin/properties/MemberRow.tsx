import { useState } from 'react'
import { ROLE_LABEL, ROLE_BADGE_STYLE } from '../../../shared/constants'
import { type PropertyMemberDto } from '../../../features/users/usersApi'
import { colors } from '../../../shared/theme'
import { IconChevronDown } from '../../../shared/icons'

export interface MemberRowProps {
  member: PropertyMemberDto
  isSelf: boolean
  isActionLoading: boolean
  showResetSuccess: boolean
  onEdit: () => void
  onToggleActive: () => void
  onForceReset: () => void
  onDelete: () => void
}

function Avatar({ initials }: { initials: string }) {
  return (
    <div
      className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 fw-semibold"
      style={{ width: 36, height: 36, backgroundColor: colors.primaryLight, color: colors.primary, fontSize: '0.78rem' }}
    >
      {initials}
    </div>
  )
}

function ExpandedActions({
  member, isSelf, isActionLoading, showResetSuccess,
  onEdit, onToggleActive, onForceReset, onDelete,
}: MemberRowProps) {
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  if (showResetSuccess) {
    return (
      <span style={{ fontSize: '0.82rem', color: colors.successText, fontWeight: 500 }}>
        ✓ Password-reset email sendt
      </span>
    )
  }

  if (confirmingDelete) {
    return (
      <div className="d-flex align-items-center gap-2 flex-wrap">
        <span style={{ fontSize: '0.82rem', color: colors.textSecondary }}>Fjern bruger fra ejendom?</span>
        <button
          className="btn btn-danger btn-sm"
          style={{ fontSize: '0.78rem' }}
          disabled={isActionLoading}
          onClick={onDelete}
        >
          {isActionLoading ? '…' : 'Bekræft'}
        </button>
        <button
          className="btn btn-outline-secondary btn-sm"
          style={{ fontSize: '0.78rem' }}
          onClick={() => setConfirmingDelete(false)}
        >
          Annuller
        </button>
      </div>
    )
  }

  return (
    <div className="d-flex align-items-center gap-2 flex-wrap">
      <button
        className="btn btn-sm btn-outline-secondary"
        style={{ fontSize: '0.8rem' }}
        onClick={onEdit}
      >
        Rediger rolle/lejl.
      </button>
      <button
        className="btn btn-sm btn-outline-secondary"
        style={{ fontSize: '0.8rem' }}
        disabled={isActionLoading || isSelf}
        onClick={onToggleActive}
      >
        {member.isActive ? 'Deaktiver adgang' : 'Aktiver adgang'}
      </button>
      <button
        className="btn btn-sm btn-outline-secondary"
        style={{ fontSize: '0.8rem' }}
        disabled={isActionLoading}
        onClick={onForceReset}
      >
        Tving passwordskift
      </button>
      <button
        className="btn btn-sm"
        style={{ fontSize: '0.8rem', marginLeft: 'auto', color: colors.dangerText, border: `1px solid ${colors.dangerBorder}`, backgroundColor: 'transparent' }}
        disabled={isActionLoading || isSelf}
        onClick={() => setConfirmingDelete(true)}
      >
        Fjern fra ejendom
      </button>
    </div>
  )
}

// ── Desktop table row ──────────────────────────────────────────────────────────

export function MemberRow(props: MemberRowProps) {
  const { member } = props
  const [expanded, setExpanded] = useState(false)
  const badge = ROLE_BADGE_STYLE[member.role]
  const initials = [member.firstName, member.lastName]
    .filter(Boolean).map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    || member.email[0].toUpperCase()
  const displayName = [member.firstName, member.lastName].filter(Boolean).join(' ') || '—'

  return (
    <>
      <tr style={{ opacity: member.isActive ? 1 : 0.55 }}>
        <td className="px-4 py-3 align-middle">
          <div className="d-flex align-items-center gap-3">
            <Avatar initials={initials} />
            <span className="fw-medium" style={{ color: colors.textPrimary }}>{displayName}</span>
          </div>
        </td>
        <td className="px-4 py-3 align-middle" style={{ color: colors.textSecondary }}>{member.email}</td>
        <td className="px-4 py-3 align-middle" style={{ color: colors.textPrimary }}>
          {member.apartmentNumber ?? <span style={{ color: colors.textMuted }}>—</span>}
        </td>
        <td className="px-4 py-3 align-middle">
          <span className="badge" style={{ backgroundColor: badge.bg, color: badge.color, fontWeight: 500, fontSize: '0.75rem' }}>
            {ROLE_LABEL[member.role]}
          </span>
        </td>
        <td className="px-4 py-3 align-middle">
          {member.isActive
            ? <span style={{ color: colors.successText, fontSize: '0.78rem', fontWeight: 500 }}>● Aktiv</span>
            : <span style={{ color: colors.textMuted, fontSize: '0.78rem', fontWeight: 500 }}>● Deaktiveret</span>
          }
        </td>
        <td className="px-4 py-3 align-middle text-end">
          <button
            className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1 ms-auto"
            style={{ fontSize: '0.8rem', borderRadius: '6px' }}
            onClick={() => setExpanded((v) => !v)}
          >
            Handlinger
            <span style={{ transition: 'transform 0.15s', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', display: 'flex' }}>
              <IconChevronDown size={13} strokeWidth={2.5} />
            </span>
          </button>
        </td>
      </tr>
      {expanded && (
        <tr style={{ backgroundColor: colors.bgPage }}>
          <td colSpan={6} className="px-4 py-2" style={{ borderTop: `1px solid ${colors.borderRow}` }}>
            <ExpandedActions {...props} />
          </td>
        </tr>
      )}
    </>
  )
}

// ── Mobile card ────────────────────────────────────────────────────────────────

export function MemberCard(props: MemberRowProps) {
  const { member } = props
  const [expanded, setExpanded] = useState(false)
  const badge = ROLE_BADGE_STYLE[member.role]
  const initials = [member.firstName, member.lastName]
    .filter(Boolean).map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    || member.email[0].toUpperCase()
  const displayName = [member.firstName, member.lastName].filter(Boolean).join(' ') || '—'

  return (
    <div style={{ borderBottom: `1px solid ${colors.borderRow}`, opacity: member.isActive ? 1 : 0.55 }}>
      <div style={{ padding: '12px 16px' }}>
        <div className="d-flex align-items-start gap-3">
          <Avatar initials={initials} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="d-flex align-items-start justify-content-between gap-2">
              <div style={{ minWidth: 0 }}>
                <div className="fw-medium text-truncate" style={{ color: colors.textPrimary, fontSize: '0.9rem' }}>
                  {displayName}
                </div>
                <div className="text-truncate" style={{ fontSize: '0.78rem', color: colors.textSecondary, marginTop: 1 }}>
                  {member.email}
                </div>
              </div>
              <button
                className="btn btn-sm btn-outline-secondary flex-shrink-0 d-flex align-items-center gap-1"
                style={{ fontSize: '0.78rem', borderRadius: '6px' }}
                onClick={() => setExpanded((v) => !v)}
              >
                Handlinger
                <span style={{ transition: 'transform 0.15s', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', display: 'flex' }}>
                  <IconChevronDown size={12} strokeWidth={2.5} />
                </span>
              </button>
            </div>
            <div className="d-flex align-items-center gap-2 flex-wrap mt-2">
              {member.apartmentNumber && (
                <span style={{ fontSize: '0.75rem', color: colors.textMuted }}>
                  Lejl. {member.apartmentNumber}
                </span>
              )}
              <span
                className="badge"
                style={{ backgroundColor: badge.bg, color: badge.color, fontWeight: 500, fontSize: '0.72rem' }}
              >
                {ROLE_LABEL[member.role]}
              </span>
              <span style={{
                fontSize: '0.75rem', fontWeight: 500,
                color: member.isActive ? colors.successText : colors.textMuted,
              }}>
                {member.isActive ? '● Aktiv' : '● Deaktiveret'}
              </span>
            </div>
          </div>
        </div>
      </div>
      {expanded && (
        <div style={{ padding: '8px 16px 12px', borderTop: `1px solid ${colors.borderRow}`, backgroundColor: colors.bgPage }}>
          <ExpandedActions {...props} />
        </div>
      )}
    </div>
  )
}
