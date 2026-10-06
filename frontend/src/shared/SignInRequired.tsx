import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAppDispatch } from '../app/hooks'
import { openModal } from './modals/modalSlice'
import { BrandLogo } from './BrandLogo'
import { colors } from './theme'

// Shown in place of a protected page when there is no valid session (never logged in, or the
// cookie expired). Staying on the URL means the user lands back on the same page after logging in.
export function SignInRequired() {
  const { t } = useTranslation()
  const location = useLocation()
  const dispatch = useAppDispatch()
  const redirectTo = location.pathname + location.search

  useEffect(() => {
    dispatch(openModal({ name: 'login', props: { redirectTo } }))
  }, [dispatch, redirectTo])

  return (
    <div className="d-flex justify-content-center align-items-center px-3" style={{ minHeight: '100vh', backgroundColor: colors.bgPage }}>
      <div className="bg-white rounded-3 p-4 p-md-5 text-center" style={{ width: '100%', maxWidth: 420, border: `1px solid ${colors.borderDefault}` }}>
        <BrandLogo size={28} />
        <h1 className="fw-bold mt-3 mb-2" style={{ fontSize: '1.3rem', color: colors.textPrimary }}>
          {t('auth.signInRequiredTitle')}
        </h1>
        <p style={{ color: colors.textSecondary, fontSize: '0.9rem' }}>{t('auth.signInRequiredBody')}</p>
        <div className="d-flex justify-content-center gap-2 mt-3">
          <button type="button" className="btn btn-primary fw-semibold" onClick={() => dispatch(openModal({ name: 'login', props: { redirectTo } }))}>
            {t('auth.login')}
          </button>
          <Link to="/" className="btn btn-outline-secondary">{t('auth.goHome')}</Link>
        </div>
      </div>
    </div>
  )
}
