import { ROLE_LABEL, ROLE_BADGE_STYLE } from '../../../shared/constants'
import { type PropertyMemberDto, type PendingInviteDto } from '../../../features/users/usersApi'
import { colors } from '../../../shared/theme'
import { ActionMenu } from './ActionMenu'

// ── Prop types ─────────────────────────────────────────────────────────────────

interface MemberProps {
  kind: 'member'
  member: PropertyMemberDto
  isSelf: boolean
  isActionLoading: boolean
  showResetSuccess: boolean
  isMenuOpen: boolean
  onMenuToggle: () => void
  onMenuClose: () => void
  onEdit: () => void
  onToggleActive: () => void
  onForceReset: () => void
  onDelete: () => void
}

interface InviteProps {
  kind: 'invite'
  invite: PendingInviteDto
  isActionLoading: boolean
  showResendSuccess: boolean
  isMenuOpen: boolean
  onMenuToggle: () => void
  onMenuClose: () => void
  onResend: () => void
  onDelete: () => void
}

export type UserRowProps = MemberProps | InviteProps

// ── Shared UI ──────────────────────────────────────────────────────────────────

function Avatar({ initials, pending }: { initials: string; pending?: boolean }) {
  return (
    <div
      className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 fw-semibold"
      style={{
        width: 36, height: 36, fontSize: '0.78rem',
        backgroundColor: pending ? colors.bgSubtle : colors.primaryLight,
        color: pending ? colors.textMuted : colors.primary,
      }}
    >
      {initials}
    </div>
  )
}

function initials(m: PropertyMemberDto) {
  return [m.firstName, m.lastName].filter(Boolean).map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    || m.email[0].toUpperCase()
}

function displayName(m: PropertyMemberDto) {
  return [m.firstName, m.lastName].filter(Boolean).join(' ') || '—'
}

// ── Desktop table row ──────────────────────────────────────────────────────────

export function UserRow(props: UserRowProps) {
  if (props.kind === 'member') {
    const { member, isSelf, isActionLoading, showResetSuccess, isMenuOpen, onMenuToggle, onMenuClose, onEdit, onToggleActive, onForceReset, onDelete } = props
    const badge = ROLE_BADGE_STYLE[member.role]
    return (
      <tr style={{ opacity: member.isActive ? 1 : 0.55 }}>
        <td className="px-4 py-3 align-middle">
          <div className="d-flex align-items-center gap-3">
            <Avatar initials={initials(member)} />
            <span className="fw-medium" style={{ color: colors.textPrimary }}>{displayName(member)}</span>
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
        <td className="px-4 py-3 align-middle">
          <div className="d-flex align-items-center justify-content-end gap-2">
            {showResetSuccess && (
              <span style={{ fontSize: '0.78rem', color: colors.successText, fontWeight: 500, whiteSpace: 'nowrap' }}>✓ Sendt</span>
            )}
            <ActionMenu
              kind="member"
              member={member}
              isSelf={isSelf}
              isActionLoading={isActionLoading}
              isMenuOpen={isMenuOpen}
              onMenuToggle={onMenuToggle}
              onMenuClose={onMenuClose}
              onEdit={onEdit}
              onToggleActive={onToggleActive}
              onForceReset={onForceReset}
              onDelete={onDelete}
            />
          </div>
        </td>
      </tr>
    )
  }

  // kind === 'invite'
  const { invite, isActionLoading, showResendSuccess, isMenuOpen, onMenuToggle, onMenuClose, onResend, onDelete } = props
  return (
    <tr>
      <td className="px-4 py-3 align-middle">
        <div className="d-flex align-items-center gap-3">
          <Avatar initials="?" pending />
          <span style={{ color: colors.textMuted, fontSize: '0.85rem', fontStyle: 'italic' }}>Ikke oprettet endnu</span>
        </div>
      </td>
      <td className="px-4 py-3 align-middle" style={{ color: colors.textSecondary }}>{invite.email}</td>
      <td className="px-4 py-3 align-middle" style={{ color: colors.textMuted }}>{invite.apartmentNumber ?? '—'}</td>
      <td className="px-4 py-3 align-middle">
        <span className="badge" style={{ backgroundColor: colors.bgSubtle, color: colors.textSecondary, fontWeight: 500, fontSize: '0.75rem' }}>
          {ROLE_LABEL[invite.role]}
        </span>
      </td>
      <td className="px-4 py-3 align-middle">
        <span style={{ color: colors.warningText, fontSize: '0.78rem', fontWeight: 500 }}>● Afventer</span>
      </td>
      <td className="px-4 py-3 align-middle">
        <div className="d-flex align-items-center justify-content-end gap-2">
          {showResendSuccess && (
            <span style={{ fontSize: '0.78rem', color: colors.successText, fontWeight: 500, whiteSpace: 'nowrap' }}>✓ Sendt</span>
          )}
          <ActionMenu
            kind="invite"
            isActionLoading={isActionLoading}
            isMenuOpen={isMenuOpen}
            onMenuToggle={onMenuToggle}
            onMenuClose={onMenuClose}
            onResend={onResend}
            onDelete={onDelete}
          />
        </div>
      </td>
    </tr>
  )
}

// ── Mobile card ────────────────────────────────────────────────────────────────

export function UserCard(props: UserRowProps) {
  if (props.kind === 'member') {
    const { member, isSelf, isActionLoading, showResetSuccess, isMenuOpen, onMenuToggle, onMenuClose, onEdit, onToggleActive, onForceReset, onDelete } = props
    const badge = ROLE_BADGE_STYLE[member.role]
    return (
      <div style={{ borderBottom: `1px solid ${colors.borderRow}`, padding: '12px 16px', opacity: member.isActive ? 1 : 0.55 }}>
        <div className="d-flex align-items-start gap-3">
          <Avatar initials={initials(member)} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="d-flex align-items-start justify-content-between gap-2">
              <div style={{ minWidth: 0 }}>
                <div className="fw-medium text-truncate" style={{ color: colors.textPrimary, fontSize: '0.9rem' }}>
                  {displayName(member)}
                </div>
                <div className="text-truncate" style={{ fontSize: '0.78rem', color: colors.textSecondary, marginTop: 1 }}>
                  {member.email}
                </div>
              </div>
              <div className="d-flex align-items-center gap-2 flex-shrink-0">
                {showResetSuccess && (
                  <span style={{ fontSize: '0.75rem', color: colors.successText, fontWeight: 500, whiteSpace: 'nowrap' }}>✓ Sendt</span>
                )}
                <ActionMenu
                  kind="member"
                  member={member}
                  isSelf={isSelf}
                  isActionLoading={isActionLoading}
                  isMenuOpen={isMenuOpen}
                  onMenuToggle={onMenuToggle}
                  onMenuClose={onMenuClose}
                  onEdit={onEdit}
                  onToggleActive={onToggleActive}
                  onForceReset={onForceReset}
                  onDelete={onDelete}
                />
              </div>
            </div>
            <div className="d-flex align-items-center gap-2 flex-wrap mt-2">
              {member.apartmentNumber && (
                <span style={{ fontSize: '0.75rem', color: colors.textMuted }}>Lejl. {member.apartmentNumber}</span>
              )}
              <span className="badge" style={{ backgroundColor: badge.bg, color: badge.color, fontWeight: 500, fontSize: '0.72rem' }}>
                {ROLE_LABEL[member.role]}
              </span>
              <span style={{ fontSize: '0.75rem', fontWeight: 500, color: member.isActive ? colors.successText : colors.textMuted }}>
                {member.isActive ? '● Aktiv' : '● Deaktiveret'}
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // kind === 'invite'
  const { invite, isActionLoading, showResendSuccess, isMenuOpen, onMenuToggle, onMenuClose, onResend, onDelete } = props
  return (
    <div style={{ borderBottom: `1px solid ${colors.borderRow}`, padding: '12px 16px' }}>
      <div className="d-flex align-items-start gap-3">
        <Avatar initials="?" pending />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="d-flex align-items-start justify-content-between gap-2">
            <div style={{ minWidth: 0 }}>
              <div style={{ color: colors.textMuted, fontSize: '0.85rem', fontStyle: 'italic' }}>Ikke oprettet endnu</div>
              <div className="text-truncate" style={{ fontSize: '0.78rem', color: colors.textSecondary, marginTop: 1 }}>
                {invite.email}
              </div>
            </div>
            <div className="d-flex align-items-center gap-2 flex-shrink-0">
              {showResendSuccess && (
                <span style={{ fontSize: '0.75rem', color: colors.successText, fontWeight: 500, whiteSpace: 'nowrap' }}>✓ Sendt</span>
              )}
              <ActionMenu
                kind="invite"
                isActionLoading={isActionLoading}
                isMenuOpen={isMenuOpen}
                onMenuToggle={onMenuToggle}
                onMenuClose={onMenuClose}
                onResend={onResend}
                onDelete={onDelete}
              />
            </div>
          </div>
          <div className="d-flex align-items-center gap-2 flex-wrap mt-2">
            {invite.apartmentNumber && (
              <span style={{ fontSize: '0.75rem', color: colors.textMuted }}>Lejl. {invite.apartmentNumber}</span>
            )}
            <span className="badge" style={{ backgroundColor: colors.bgSubtle, color: colors.textSecondary, fontWeight: 500, fontSize: '0.72rem' }}>
              {ROLE_LABEL[invite.role]}
            </span>
            <span style={{ fontSize: '0.75rem', fontWeight: 500, color: colors.warningText }}>● Afventer</span>
          </div>
        </div>
      </div>
    </div>
  )
}
