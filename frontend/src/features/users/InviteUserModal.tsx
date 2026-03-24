import { useState } from 'react'
import { ModalShell } from '../../shared/modals/ModalShell'
import { EmailInviteTab } from './EmailInviteTab'
import { QrInviteTab } from './QrInviteTab'

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
                backgroundColor: isActive ? '#e8f0fe' : 'transparent',
                color: isActive ? '#1565c0' : '#5a6a7a',
                border: isActive ? '1px solid #c5d8fb' : '1px solid #e8ecf0',
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
