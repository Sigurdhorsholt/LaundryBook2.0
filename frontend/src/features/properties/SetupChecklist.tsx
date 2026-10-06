import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useGetLaundryRoomsQuery } from '../laundry/laundryApi'
import { useGetPropertyMembersQuery, useGetPendingInvitesQuery } from '../users/usersApi'
import { BookingMode, useGetPropertyQuery } from './propertiesApi'
import { IconCheck, IconChevronRight } from '../../shared/icons'
import { colors } from '../../shared/theme'

interface Props {
  propertyId: string
  propertyName: string
}

interface Step {
  key: string
  label: string
  description: string
  done: boolean
  path: string
}

// Guides a new admin through what residents need before they can book; hidden once everything is done.
export function SetupChecklist({ propertyId, propertyName }: Props) {
  const { t } = useTranslation()
  const { data: rooms } = useGetLaundryRoomsQuery(propertyId)
  const { data: property } = useGetPropertyQuery(propertyId)
  const { data: members } = useGetPropertyMembersQuery(propertyId)
  const { data: pendingInvites } = useGetPendingInvitesQuery(propertyId)

  if (!rooms || !property || !members || !pendingInvites) return null

  const base = `/admin/properties/${propertyId}`
  const hasRooms = rooms.length > 0
  const steps: Step[] = [
    {
      key: 'rooms',
      label: t('adminDashboard.setup.rooms'),
      description: t('adminDashboard.setup.roomsDesc'),
      done: hasRooms,
      path: `${base}/laundry`,
    },
    ...(property.settings.bookingMode === BookingMode.BookSpecificMachine
      ? [{
          key: 'machines',
          label: t('adminDashboard.setup.machines'),
          description: t('adminDashboard.setup.machinesDesc'),
          done: hasRooms && rooms.every((r) => r.machineCount > 0),
          path: `${base}/laundry`,
        }]
      : []),
    {
      key: 'timeslots',
      label: t('adminDashboard.setup.timeslots'),
      description: t('adminDashboard.setup.timeslotsDesc'),
      done: hasRooms && rooms.every((r) => r.timeSlotCount > 0),
      path: `${base}/timeslots`,
    },
    {
      key: 'invite',
      label: t('adminDashboard.setup.invite'),
      description: t('adminDashboard.setup.inviteDesc'),
      // The admin is a member themselves, so "invited someone" means anyone else or a pending invite
      done: members.length > 1 || pendingInvites.length > 0,
      path: `${base}/users`,
    },
  ]

  const doneCount = steps.filter((s) => s.done).length
  if (doneCount === steps.length) return null
  const nextKey = steps.find((s) => !s.done)?.key

  return (
    <section className="bg-white rounded-3 mb-4" style={{ border: `1px solid ${colors.primaryBorder}` }}>
      <div className="d-flex align-items-baseline justify-content-between gap-2 px-4 pt-4 pb-2 flex-wrap">
        <h2 className="fw-semibold mb-0" style={{ fontSize: '1rem', color: colors.textPrimary }}>
          {t('adminDashboard.setup.title', { property: propertyName })}
        </h2>
        <span style={{ fontSize: '0.8rem', color: colors.textSecondary }}>
          {t('adminDashboard.setup.progress', { done: doneCount, total: steps.length })}
        </span>
      </div>
      <ol className="list-unstyled mb-0 pb-2">
        {steps.map((step, i) => (
          <li key={step.key}>
            <Link
              to={step.path}
              className="d-flex align-items-center gap-3 px-4 py-3 text-decoration-none"
              style={{ borderTop: i === 0 ? 'none' : `1px solid ${colors.borderRow}` }}
            >
              <span
                className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                style={{
                  width: 28, height: 28, fontSize: '0.8rem', fontWeight: 700,
                  backgroundColor: step.done ? colors.primary : colors.bgCard,
                  color: step.done ? colors.bgCard : colors.textSecondary,
                  border: `1.5px solid ${step.done ? colors.primary : colors.borderStrong}`,
                }}
                aria-hidden="true"
              >
                {step.done ? <IconCheck size={14} color={colors.bgCard} strokeWidth={3} /> : i + 1}
              </span>
              <span style={{ minWidth: 0, flex: 1 }}>
                <span
                  className="d-block fw-semibold"
                  style={{
                    fontSize: '0.9rem',
                    color: step.done ? colors.textMuted : colors.textPrimary,
                    textDecoration: step.done ? 'line-through' : 'none',
                  }}
                >
                  {step.label}
                  <span className="visually-hidden"> {step.done ? t('adminDashboard.setup.stepDone') : ''}</span>
                </span>
                {step.key === nextKey && (
                  <span className="d-block" style={{ fontSize: '0.8rem', color: colors.textSecondary }}>
                    {step.description}
                  </span>
                )}
              </span>
              <IconChevronRight size={16} color={colors.textMuted} />
            </Link>
          </li>
        ))}
      </ol>
    </section>
  )
}
