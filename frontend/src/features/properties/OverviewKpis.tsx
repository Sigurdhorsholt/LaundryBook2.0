import { useTranslation } from 'react-i18next'
import { formatDateFull } from '../../shared/utils/dateUtils'
import { colors } from '../../shared/theme'

interface Props {
  weekCount: number
  weekDelta: number
  utilization: number
  busiestDay: string | null
  residents: number
  pendingInvites: number
  todayCount: number
  laterToday: number
}

export function OverviewKpis({ weekCount, weekDelta, utilization, busiestDay, residents, pendingInvites, todayCount, laterToday }: Props) {
  const { t } = useTranslation()
  const kpis = [
    {
      label: t('adminOverview.kpi.weekBookings'),
      value: String(weekCount),
      note: weekDelta > 0
        ? t('adminOverview.kpi.moreThanLastWeek', { count: weekDelta })
        : weekDelta < 0
          ? t('adminOverview.kpi.fewerThanLastWeek', { count: -weekDelta })
          : t('adminOverview.kpi.sameAsLastWeek'),
    },
    {
      label: t('adminOverview.kpi.utilization'),
      value: `${utilization} %`,
      note: busiestDay ? t('adminOverview.kpi.busiest', { day: formatDateFull(busiestDay) }) : t('adminOverview.kpi.noBookingsYet'),
    },
    {
      label: t('adminOverview.kpi.residents'),
      value: String(residents),
      note: pendingInvites > 0 ? t('adminOverview.kpi.invitesPending', { count: pendingInvites }) : t('adminOverview.kpi.noInvitesPending'),
    },
    {
      label: t('adminOverview.kpi.today'),
      value: String(todayCount),
      note: t('adminOverview.kpi.laterToday', { count: laterToday }),
    },
  ]

  return (
    <div className="row g-3 mb-4">
      {kpis.map(k => (
        <div key={k.label} className="col-6 col-xl-3">
          <section
            style={{
              height: '100%', backgroundColor: colors.bgCard, border: `1px solid ${colors.borderDefault}`,
              borderRadius: 14, padding: '16px 18px',
            }}
          >
            <h2 style={{ margin: 0, fontSize: '0.8rem', fontWeight: 600, color: colors.textSecondary }}>{k.label}</h2>
            <p style={{ margin: '4px 0 2px', fontSize: '1.9rem', fontWeight: 800, letterSpacing: '-0.5px', color: colors.textPrimary, lineHeight: 1.1 }}>
              {k.value}
            </p>
            <p style={{ margin: 0, fontSize: '0.8rem', color: colors.textMuted }}>{k.note}</p>
          </section>
        </div>
      ))}
    </div>
  )
}
