import { useTranslation } from 'react-i18next'
import { BrandLogo } from '../../../shared/BrandLogo'
import { colors } from '../../../shared/theme'
import { NAVBAR_HEIGHT_PX } from '../../../shared/constants'
import { PREVIEW_PROPERTY } from './previewData'

interface Props {
  admin?: boolean
}

// A look-alike of the app's header; the real one needs a signed-in user
export function PreviewAppBar({ admin = false }: Props) {
  const { t } = useTranslation()
  const items = admin ? [t('nav.overview'), t('nav.laundry')] : [t('nav.laundry'), t('nav.propertyInfo'), t('nav.myPage')]

  return (
    <div className="d-flex align-items-center gap-3 px-4" style={{ height: NAVBAR_HEIGHT_PX, backgroundColor: colors.chrome, color: colors.chromeText }}>
      <span className="d-flex align-items-center gap-2" style={{ fontWeight: 700, color: colors.bgCard }}>
        <BrandLogo size={20} color={colors.chromeAccent} />
        LaundryBook
      </span>
      <span style={{ padding: '4px 12px', borderRadius: 999, backgroundColor: colors.chromeRaised, fontSize: '0.8rem', fontWeight: 500 }}>
        {admin ? t('nav.admin') : PREVIEW_PROPERTY}
      </span>
      <span className="d-flex gap-1">
        {items.map((item, i) => (
          <span
            key={item}
            style={{
              padding: '7px 12px', borderRadius: 8, fontSize: '0.88rem',
              fontWeight: i === 0 ? 600 : 500, color: i === 0 ? colors.bgCard : colors.chromeMuted,
              backgroundColor: i === 0 ? colors.chromeRaised : 'transparent',
            }}
          >
            {item}
          </span>
        ))}
      </span>
      <span className="ms-auto d-inline-flex align-items-center justify-content-center" style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: colors.chromeAccent, color: colors.chrome, fontSize: '0.78rem', fontWeight: 700 }}>
        MH
      </span>
    </div>
  )
}
