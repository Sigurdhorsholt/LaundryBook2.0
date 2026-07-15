import { useTranslation } from 'react-i18next'
import { useRoleLabel, ROLE_BADGE_STYLE } from '../../../shared/constants'
import { type PropertyMemberDto, type PendingInviteDto } from '../../../features/users/usersApi'
import { colors } from '../../../shared/theme'
import { ActionMenu } from './ActionMenu'
import { IconCheck } from '../../../shared/icons'

function StatusDot({ color }: { color: string }) {
  return (
    <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', backgroundColor: color, marginRight: 4, verticalAlign: 'middle' }} />
  )
}

function SentLabel({ size = '0.78rem' }: { size?: string }) {
  const { t } = useTranslation()
  return (
    <span style={{ fontSize: size, color: colors.successText, fontWeight: 500, whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
      <IconCheck size={12} color={colors.successText} strokeWidth={2.5} />
      {t('adminProperties.userRow.sent')}
    </span>
  )
}

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
  const { t } = useTranslation()
  const roleLabel = useRoleLabel()
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
            {roleLabel(member.role)}
          </span>
        </td>
        <td className="px-4 py-3 align-middle">
          {member.isActive
            ? <span style={{ color: colors.successText, fontSize: '0.78rem', fontWeight: 500 }}><StatusDot color={colors.successText} />{t('adminProperties.userRow.active')}</span>
            : <span style={{ color: colors.textMuted, fontSize: '0.78rem', fontWeight: 500 }}><StatusDot color={colors.textMuted} />{t('adminProperties.userRow.deactivated')}</span>
          }
        </td>
        <td className="px-4 py-3 align-middle">
          <div className="d-flex align-items-center justify-content-end gap-2">
            {showResetSuccess && <SentLabel />}
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
          <span style={{ color: colors.textMuted, fontSize: '0.85rem', fontStyle: 'italic' }}>{t('adminProperties.userRow.notCreatedYet')}</span>
        </div>
      </td>
      <td className="px-4 py-3 align-middle" style={{ color: colors.textSecondary }}>{invite.email}</td>
      <td className="px-4 py-3 align-middle" style={{ color: colors.textMuted }}>{invite.apartmentNumber ?? '—'}</td>
      <td className="px-4 py-3 align-middle">
        <span className="badge" style={{ backgroundColor: colors.bgSubtle, color: colors.textSecondary, fontWeight: 500, fontSize: '0.75rem' }}>
          {roleLabel(invite.role)}
        </span>
      </td>
      <td className="px-4 py-3 align-middle">
        <span style={{ color: colors.warningText, fontSize: '0.78rem', fontWeight: 500 }}><StatusDot color={colors.warningText} />{t('adminProperties.userRow.pending')}</span>
      </td>
      <td className="px-4 py-3 align-middle">
        <div className="d-flex align-items-center justify-content-end gap-2">
          {showResendSuccess && <SentLabel />}
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
  const { t } = useTranslation()
  const roleLabel = useRoleLabel()
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
                {showResetSuccess && <SentLabel size="0.75rem" />}
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
                <span style={{ fontSize: '0.75rem', color: colors.textMuted }}>{t('adminProperties.userRow.apartment', { number: member.apartmentNumber })}</span>
              )}
              <span className="badge" style={{ backgroundColor: badge.bg, color: badge.color, fontWeight: 500, fontSize: '0.72rem' }}>
                {roleLabel(member.role)}
              </span>
              <span style={{ fontSize: '0.75rem', fontWeight: 500, color: member.isActive ? colors.successText : colors.textMuted }}>
                <StatusDot color={member.isActive ? colors.successText : colors.textMuted} />
                {member.isActive ? t('adminProperties.userRow.active') : t('adminProperties.userRow.deactivated')}
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
              <div style={{ color: colors.textMuted, fontSize: '0.85rem', fontStyle: 'italic' }}>{t('adminProperties.userRow.notCreatedYet')}</div>
              <div className="text-truncate" style={{ fontSize: '0.78rem', color: colors.textSecondary, marginTop: 1 }}>
                {invite.email}
              </div>
            </div>
            <div className="d-flex align-items-center gap-2 flex-shrink-0">
              {showResendSuccess && <SentLabel size="0.75rem" />}
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
              <span style={{ fontSize: '0.75rem', color: colors.textMuted }}>{t('adminProperties.userRow.apartment', { number: invite.apartmentNumber })}</span>
            )}
            <span className="badge" style={{ backgroundColor: colors.bgSubtle, color: colors.textSecondary, fontWeight: 500, fontSize: '0.72rem' }}>
              {roleLabel(invite.role)}
            </span>
            <span style={{ fontSize: '0.75rem', fontWeight: 500, color: colors.warningText }}><StatusDot color={colors.warningText} />{t('adminProperties.userRow.pending')}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
