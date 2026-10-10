import { useTranslation } from 'react-i18next'
import { ScaledToFit } from './ScaledToFit'
import { IconBuilding, IconCalendar, IconUser } from '../../../shared/icons'
import { colors } from '../../../shared/theme'
import { BOTTOM_TAB_HEIGHT_PX } from '../../../shared/constants'

interface Props {
  label: string
  // Outer width of the phone on the page; the screen inside is laid out at a real phone's size
  width: number
  children: React.ReactNode
}

const SCREEN_WIDTH = 375
const SCREEN_HEIGHT = 740
const BEZEL = 10

// A look-alike of the app's bottom tabs, on the booking tab
function TabBar() {
  const { t } = useTranslation()
  const tabs = [
    { label: t('nav.laundry'), Icon: IconCalendar },
    { label: t('nav.propertyInfo'), Icon: IconBuilding },
    { label: t('nav.myPage'), Icon: IconUser },
  ]
  return (
    <div className="d-flex justify-content-around align-items-center" style={{ height: BOTTOM_TAB_HEIGHT_PX, flexShrink: 0, backgroundColor: colors.bgCard, borderTop: `1px solid ${colors.borderDefault}` }}>
      {tabs.map(({ label, Icon }, i) => (
        <span key={label} className="d-flex flex-column align-items-center gap-1" style={{ fontSize: '0.7rem', fontWeight: i === 0 ? 700 : 500, color: i === 0 ? colors.primaryMutedText : colors.textSecondary }}>
          <span className="d-flex align-items-center justify-content-center" style={{ width: 56, height: 30, borderRadius: 999, backgroundColor: i === 0 ? colors.primaryLight : 'transparent' }}>
            <Icon size={20} />
          </span>
          {label}
        </span>
      ))}
    </div>
  )
}

export function PhoneFrame({ label, width, children }: Props) {
  return (
    <div
      role="img"
      aria-label={label}
      className="mx-auto"
      style={{ width, maxWidth: '100%', padding: BEZEL, borderRadius: 40, backgroundColor: colors.chrome, boxShadow: '0 24px 60px rgba(18,32,26,0.22)' }}
    >
      <div style={{ borderRadius: 30, overflow: 'hidden', backgroundColor: colors.bgPage }}>
        <ScaledToFit designWidth={SCREEN_WIDTH}>
          <div inert aria-hidden="true" style={{ height: SCREEN_HEIGHT, display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>{children}</div>
            <TabBar />
          </div>
        </ScaledToFit>
      </div>
    </div>
  )
}
