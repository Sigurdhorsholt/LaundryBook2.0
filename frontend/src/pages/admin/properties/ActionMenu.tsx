import { useState, useRef, useEffect, useLayoutEffect, useId } from 'react'
import { useTranslation } from 'react-i18next'
import { createPortal } from 'react-dom'
import { type PropertyMemberDto } from '../../../features/users/usersApi'
import { colors } from '../../../shared/theme'
import { IconMoreVertical } from '../../../shared/icons'

// ── Prop types ─────────────────────────────────────────────────────────────────

interface MemberActionMenuProps {
  kind: 'member'
  member: PropertyMemberDto
  isSelf: boolean
  isActionLoading: boolean
  isMenuOpen: boolean
  onMenuToggle: () => void
  onMenuClose: () => void
  onEdit: () => void
  onToggleActive: () => void
  onForceReset: () => void
  onDelete: () => void
}

interface InviteActionMenuProps {
  kind: 'invite'
  isActionLoading: boolean
  isMenuOpen: boolean
  onMenuToggle: () => void
  onMenuClose: () => void
  onResend: () => void
  onDelete: () => void
}

export type ActionMenuProps = MemberActionMenuProps | InviteActionMenuProps

// ── Internal helpers ───────────────────────────────────────────────────────────

function MenuButton({ children, style, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      role="menuitem"
      className="btn btn-link w-100 text-start px-3 py-2 text-decoration-none border-0 d-block"
      style={{ fontSize: '0.82rem', color: colors.textPrimary, whiteSpace: 'nowrap', ...style }}
      {...rest}
    >
      {children}
    </button>
  )
}

function Divider() {
  return <div style={{ borderTop: `1px solid ${colors.borderRow}`, margin: '4px 0' }} />
}

interface ConfirmPanelProps {
  message: string
  isLoading: boolean
  onConfirm: () => void
  onCancel: () => void
}

function ConfirmPanel({ message, isLoading, onConfirm, onCancel }: ConfirmPanelProps) {
  const { t } = useTranslation()
  return (
    <div className="px-3 py-2" role="group" aria-label={message}>
      <div className="mb-2" style={{ fontSize: '0.78rem', color: colors.textSecondary }}>{message}</div>
      <div className="d-flex gap-2">
        <button type="button" className="btn btn-danger btn-sm w-100" style={{ fontSize: '0.75rem' }}
          disabled={isLoading} onClick={onConfirm}>
          {isLoading ? '…' : t('adminProperties.actionMenu.yes')}
        </button>
        <button type="button" className="btn btn-outline-secondary btn-sm w-100" style={{ fontSize: '0.75rem' }}
          onClick={onCancel}>
          {t('adminProperties.actionMenu.no')}
        </button>
      </div>
    </div>
  )
}

// ── ActionMenu ─────────────────────────────────────────────────────────────────

export function ActionMenu(props: ActionMenuProps) {
  const { t } = useTranslation()
  const [confirming, setConfirming] = useState<'delete' | 'deactivate' | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [dropdownPos, setDropdownPos] = useState<{ top: number; right: number } | null>(null)
  const menuId = useId()
  const onMenuCloseRef = useRef(props.onMenuClose)
  useEffect(() => {
    onMenuCloseRef.current = props.onMenuClose
  })

  // Calculate dropdown position from trigger rect when menu opens (layout effect: measure before paint)
  useLayoutEffect(() => {
    if (!props.isMenuOpen || !triggerRef.current) return
    if (triggerRef.current.offsetParent === null) return
    const rect = triggerRef.current.getBoundingClientRect()
    setDropdownPos({
      top: rect.bottom + 4,
      right: window.innerWidth - rect.right,
    })
  }, [props.isMenuOpen])

  // Reset confirm state and position when the menu closes (adjusted during render, not in an effect)
  const [wasOpen, setWasOpen] = useState(props.isMenuOpen)
  if (wasOpen !== props.isMenuOpen) {
    setWasOpen(props.isMenuOpen)
    if (!props.isMenuOpen) {
      setConfirming(null)
      setDropdownPos(null)
    }
  }

  // Click-outside closes the menu
  useEffect(() => {
    if (!props.isMenuOpen) return
    // Skip when this instance is inside a display:none container (e.g. the mobile card
    // while the desktop table is visible). Both share the same isMenuOpen state, so
    // without this guard the hidden instance's listener would close the visible menu.
    if (triggerRef.current?.offsetParent === null) return
    const onMouseDown = (e: MouseEvent) => {
      if (
        !triggerRef.current?.contains(e.target as Node) &&
        !dropdownRef.current?.contains(e.target as Node)
      ) {
        onMenuCloseRef.current()
      }
    }
    // Follow the trigger while scrolling (closing on every scroll was jumpy on touch screens);
    // only close once the trigger has scrolled out of view
    const onScroll = () => {
      const rect = triggerRef.current?.getBoundingClientRect()
      if (!rect || rect.bottom < 0 || rect.top > window.innerHeight) {
        onMenuCloseRef.current()
        return
      }
      setDropdownPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right })
    }
    document.addEventListener('mousedown', onMouseDown)
    window.addEventListener('scroll', onScroll, true)
    return () => {
      document.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('scroll', onScroll, true)
    }
  }, [props.isMenuOpen])

  // Keyboard: focus moves into the menu when it opens and back to the trigger when it closes
  const menuShown = props.isMenuOpen && dropdownPos !== null
  useEffect(() => {
    if (!menuShown) return
    const trigger = triggerRef.current
    const dropdown = dropdownRef.current
    dropdown?.querySelector<HTMLElement>('button:not([disabled])')?.focus()
    return () => {
      // Only reclaim focus if it was lost with the menu (not if the user clicked somewhere else)
      if (document.activeElement === document.body || dropdown?.contains(document.activeElement)) trigger?.focus()
    }
  }, [menuShown])

  function handleMenuKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Escape' || e.key === 'Tab') {
      if (e.key === 'Escape') e.preventDefault()
      props.onMenuClose()
      return
    }
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
    e.preventDefault()
    const items = [...(dropdownRef.current?.querySelectorAll<HTMLElement>('button:not([disabled])') ?? [])]
    const index = items.indexOf(document.activeElement as HTMLElement)
    const next = e.key === 'ArrowDown' ? (index + 1) % items.length : (index - 1 + items.length) % items.length
    items[next]?.focus()
  }

  // ── Menu content ─────────────────────────────────────────────────────────────

  let menuContent: React.ReactNode

  if (props.kind === 'member') {
    const { member, isSelf, isActionLoading, onEdit, onToggleActive, onForceReset, onDelete, onMenuClose } = props

    const bookingWarning = member.upcomingBookingCount > 0
      ? ` ${t('common.upcomingBookingsWillBeCancelled', { count: member.upcomingBookingCount })}`
      : ''

    if (confirming === 'delete') {
      menuContent = (
        <ConfirmPanel
          message={t('adminProperties.actionMenu.removeUserConfirm') + bookingWarning}
          isLoading={isActionLoading}
          onConfirm={() => { onDelete(); onMenuClose() }}
          onCancel={() => setConfirming(null)}
        />
      )
    } else if (confirming === 'deactivate') {
      menuContent = (
        <ConfirmPanel
          message={t('adminProperties.actionMenu.deactivateConfirm') + bookingWarning}
          isLoading={isActionLoading}
          onConfirm={() => { onToggleActive(); onMenuClose() }}
          onCancel={() => setConfirming(null)}
        />
      )
    } else {
      menuContent = (
        <div className="py-1">
          <MenuButton onClick={() => { onEdit(); onMenuClose() }}>{t('adminProperties.actionMenu.editRole')}</MenuButton>
          <MenuButton
            disabled={isActionLoading || isSelf}
            onClick={() => {
              if (member.isActive) {
                setConfirming('deactivate')
              } else {
                onToggleActive()
                onMenuClose()
              }
            }}
          >
            {member.isActive ? t('adminProperties.actionMenu.deactivateAccess') : t('adminProperties.actionMenu.activateAccess')}
          </MenuButton>
          <MenuButton disabled={isActionLoading} onClick={() => { onForceReset(); onMenuClose() }}>
            {t('adminProperties.actionMenu.forcePasswordReset')}
          </MenuButton>
          <Divider />
          <MenuButton style={{ color: colors.dangerText }} disabled={isActionLoading || isSelf}
            onClick={() => setConfirming('delete')}>
            {t('adminProperties.actionMenu.removeFromProperty')}
          </MenuButton>
        </div>
      )
    }
  } else {
    const { isActionLoading, onResend, onDelete, onMenuClose } = props

    if (confirming === 'delete') {
      menuContent = (
        <ConfirmPanel
          message={t('adminProperties.actionMenu.deleteInviteConfirm')}
          isLoading={isActionLoading}
          onConfirm={() => { onDelete(); onMenuClose() }}
          onCancel={() => setConfirming(null)}
        />
      )
    } else {
      menuContent = (
        <div className="py-1">
          <MenuButton disabled={isActionLoading} onClick={() => { onResend(); onMenuClose() }}>
            {t('adminProperties.actionMenu.resendInvite')}
          </MenuButton>
          <Divider />
          <MenuButton style={{ color: colors.dangerText }} disabled={isActionLoading}
            onClick={() => setConfirming('delete')}>
            {t('adminProperties.actionMenu.deleteInvite')}
          </MenuButton>
        </div>
      )
    }
  }
  // ── Render ────────────────────────────────────────────────────────────────────

  const root = document.getElementById('root')

  return (
    <div style={{ display: 'inline-block' }}>
      <button
        ref={triggerRef}
        type="button"
        className="btn btn-sm btn-outline-secondary d-flex align-items-center justify-content-center"
        style={{ width: 32, height: 32, borderRadius: '6px', padding: 0 }}
        aria-label={t('adminProperties.actionMenu.actions')}
        aria-haspopup="menu"
        aria-expanded={props.isMenuOpen}
        aria-controls={props.isMenuOpen ? menuId : undefined}
        disabled={props.isActionLoading}
        onClick={props.onMenuToggle}
      >
        {props.isActionLoading
          ? <span className="spinner-border spinner-border-sm" style={{ width: 14, height: 14, borderWidth: 2 }} role="status" aria-hidden="true" />
          : <IconMoreVertical size={15} color={colors.textSecondary} />
        }
      </button>
      {props.isMenuOpen && root && dropdownPos && createPortal(
        <div
          ref={dropdownRef}
          id={menuId}
          role="menu"
          aria-label={t('adminProperties.actionMenu.actions')}
          onKeyDown={handleMenuKeyDown}
          className="bg-white shadow-lg rounded-3"
          style={{
            position: 'fixed',
            top: dropdownPos.top,
            right: dropdownPos.right,
            zIndex: 1050,
            minWidth: 190,
            border: `1px solid ${colors.borderDefault}`,
          }}
        >
          {menuContent}
        </div>,
        root
      )}
    </div>
  )
}
