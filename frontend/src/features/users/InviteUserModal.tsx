import { useState } from 'react'
import { ModalShell } from '../../shared/modals/ModalShell'
import { EmailInviteTab } from './EmailInviteTab'
import { QrInviteTab } from './QrInviteTab'
import { colors } from '../../shared/theme'

interface InviteUserModalProps {
  propertyId: string
  onClose: () => void
}

type Tab = 'email' | 'qr'

export function InviteUserModal({ propertyId, onClose }: InviteUserModalProps) {
  const [tab, setTab] = useState<Tab>('email')

  return (
    <ModalShell title="Inviter bruger" onClose={onClose}>
      <div className="d-flex gap-2 mb-4">
        {(['email', 'qr'] as Tab[]).map((t) => {
          const isActive = tab === t
          return (
            <button
              key={t}
              type="button"
              className="btn btn-sm"
              style={{
                borderRadius: '8px',
                fontSize: '0.85rem',
                backgroundColor: isActive ? colors.primaryLight : 'transparent',
                color: isActive ? colors.primary : colors.textSecondary,
                border: isActive ? `1px solid ${colors.primaryBorder}` : `1px solid ${colors.borderDefault}`,
                fontWeight: isActive ? 600 : 400,
              }}
              onClick={() => setTab(t)}
            >
              {t === 'email' ? 'E-mail invitation' : 'QR-kode'}
            </button>
          )
        })}
      </div>

      {tab === 'email'
        ? <EmailInviteTab propertyId={propertyId} onClose={onClose} />
        : <QrInviteTab propertyId={propertyId} />
      }
    </ModalShell>
  )
}
