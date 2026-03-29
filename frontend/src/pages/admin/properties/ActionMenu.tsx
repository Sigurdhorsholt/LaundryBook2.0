import { useState, useRef, useEffect } from 'react'
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

// ── ActionMenu ─────────────────────────────────────────────────────────────────

export function ActionMenu(props: ActionMenuProps) {
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [dropdownPos, setDropdownPos] = useState<{ top: number; right: number } | null>(null)
  const onMenuCloseRef = useRef(props.onMenuClose)
  onMenuCloseRef.current = props.onMenuClose

  // Calculate dropdown position from trigger rect when menu opens
  useEffect(() => {
    if (!props.isMenuOpen || !triggerRef.current) return
    if (triggerRef.current.offsetParent === null) return
    const rect = triggerRef.current.getBoundingClientRect()
    setDropdownPos({
      top: rect.bottom + 4,
      right: window.innerWidth - rect.right,
    })
  }, [props.isMenuOpen])

  // Reset confirm state and position when the menu closes
  useEffect(() => {
    if (!props.isMenuOpen) {
      setConfirmingDelete(false)
      setDropdownPos(null)
    }
  }, [props.isMenuOpen])

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
    const onScroll = () => onMenuCloseRef.current()
    document.addEventListener('mousedown', onMouseDown)
    window.addEventListener('scroll', onScroll, true)
    return () => {
      document.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('scroll', onScroll, true)
    }
  }, [props.isMenuOpen])

  // ── Menu content ─────────────────────────────────────────────────────────────

  let menuContent: React.ReactNode

  if (props.kind === 'member') {
    const { member, isSelf, isActionLoading, onEdit, onToggleActive, onForceReset, onDelete, onMenuClose } = props

    if (confirmingDelete) {
      menuContent = (
        <div className="px-3 py-2">
          <div className="mb-2" style={{ fontSize: '0.78rem', color: colors.textSecondary }}>Fjern bruger?</div>
          <div className="d-flex gap-2">
            <button type="button" className="btn btn-danger btn-sm w-100" style={{ fontSize: '0.75rem' }}
              disabled={isActionLoading} onClick={() => { onDelete(); onMenuClose() }}>
              {isActionLoading ? '…' : 'Ja'}
            </button>
            <button type="button" className="btn btn-outline-secondary btn-sm w-100" style={{ fontSize: '0.75rem' }}
              onClick={() => setConfirmingDelete(false)}>
              Nej
            </button>
          </div>
        </div>
      )
    } else {
      menuContent = (
        <div className="py-1">
          <MenuButton onClick={() => { onEdit(); onMenuClose() }}>Rediger rolle/lejl.</MenuButton>
          <MenuButton disabled={isActionLoading || isSelf} onClick={() => { onToggleActive(); onMenuClose() }}>
            {member.isActive ? 'Deaktiver adgang' : 'Aktiver adgang'}
          </MenuButton>
          <MenuButton disabled={isActionLoading} onClick={() => { onForceReset(); onMenuClose() }}>
            Tving passwordskift
          </MenuButton>
          <Divider />
          <MenuButton style={{ color: colors.dangerText }} disabled={isActionLoading || isSelf}
            onClick={() => setConfirmingDelete(true)}>
            Fjern fra ejendom
          </MenuButton>
        </div>
      )
    }
  } else {
    const { isActionLoading, onResend, onDelete, onMenuClose } = props

    if (confirmingDelete) {
      menuContent = (
        <div className="px-3 py-2">
          <div className="mb-2" style={{ fontSize: '0.78rem', color: colors.textSecondary }}>Slet invitation?</div>
          <div className="d-flex gap-2">
            <button type="button" className="btn btn-danger btn-sm w-100" style={{ fontSize: '0.75rem' }}
              disabled={isActionLoading} onClick={() => { onDelete(); onMenuClose() }}>
              {isActionLoading ? '…' : 'Ja'}
            </button>
            <button type="button" className="btn btn-outline-secondary btn-sm w-100" style={{ fontSize: '0.75rem' }}
              onClick={() => setConfirmingDelete(false)}>
              Nej
            </button>
          </div>
        </div>
      )
    } else {
      menuContent = (
        <div className="py-1">
          <MenuButton disabled={isActionLoading} onClick={() => { onResend(); onMenuClose() }}>
            Gensend invitation
          </MenuButton>
          <Divider />
          <MenuButton style={{ color: colors.dangerText }} disabled={isActionLoading}
            onClick={() => {
                console.log("test button")
                setConfirmingDelete(true)
            }}>
            Slet invitation
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
        aria-label="Handlinger"
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
