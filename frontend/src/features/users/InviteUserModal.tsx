import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ModalShell } from '../../shared/modals/ModalShell'
import { EmailInviteTab } from './EmailInviteTab'
import { QrInviteTab } from './QrInviteTab'
import { UserRole } from '../auth/authApi'
import { SegmentedControl } from '../../shared/ui/SegmentedControl'

interface InviteUserModalProps {
  propertyId: string
  onClose: () => void
  roleOptions?: { value: UserRole; label: string }[]
}

type Tab = 'email' | 'qr'

export function InviteUserModal({ propertyId, onClose, roleOptions }: InviteUserModalProps) {
  const { t } = useTranslation()
  const [tab, setTab] = useState<Tab>('email')

  return (
    <ModalShell title={t('users.inviteUser')} onClose={onClose}>
      <div className="mb-4">
        <SegmentedControl
          segments={[
            { value: 'email' as Tab, label: t('users.emailInviteTab') },
            { value: 'qr' as Tab, label: t('users.qrTab') },
          ]}
          value={tab}
          onChange={setTab}
        />
      </div>

      {tab === 'email'
        ? <EmailInviteTab propertyId={propertyId} onClose={onClose} roleOptions={roleOptions} />
        : <QrInviteTab propertyId={propertyId} roleOptions={roleOptions} />
      }
    </ModalShell>
  )
}
