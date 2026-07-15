import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useNavigate } from 'react-router-dom'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { firebaseAuth } from '../../lib/firebase'
import { useLoginMutation, useForgotPasswordMutation } from './authApi'
import { colors } from '../../shared/theme'
import { BrandLogo } from '../../shared/BrandLogo'

interface LoginModalProps {
  onClose: () => void
}

export function LoginModal({ onClose }: LoginModalProps) {
  const navigate = useNavigate()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState<string | null>(null)

  const [showForgot,  setShowForgot]  = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotSent,  setForgotSent]  = useState(false)

  const [login,          { isLoading }]           = useLoginMutation()
  const [forgotPassword, { isLoading: isSending }] = useForgotPasswordMutation()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      const credential = await signInWithEmailAndPassword(firebaseAuth, email, password)
      const idToken = await credential.user.getIdToken()
      await login({ idToken }).unwrap()
      onClose()
      navigate('/dashboard', { replace: true })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login mislykkedes. Prøv igen.')
    }
  }

  async function handleForgotSubmit(e: React.FormEvent) {
    e.preventDefault()
    await forgotPassword({ email: forgotEmail }).unwrap()
    setForgotSent(true)
  }

  function backToLogin() {
    setShowForgot(false)
    setForgotSent(false)
    setForgotEmail('')
  }

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(10,25,41,0.55)', zIndex: 2000 }}
        onClick={onClose}
      />

      {/* Card */}
      <div
        style={{
          position: 'fixed', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'calc(100% - 32px)', maxWidth: 440,
          backgroundColor: colors.bgCard,
          borderRadius: 16,
          boxShadow: '0 20px 60px rgba(10,25,41,0.18)',
          zIndex: 2001,
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Brand header */}
        <div style={{
          backgroundColor: colors.primaryLighter,
          borderBottom: `1px solid ${colors.primaryBorder}`,
          padding: '18px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <BrandLogo size={19} />
            <span style={{ fontWeight: 700, color: colors.textPrimary, fontSize: '1rem', letterSpacing: '-0.2px' }}>
              LaundryBook
            </span>
          </div>
          <button type="button" className="btn-close" aria-label="Luk" onClick={onClose} style={{ fontSize: '0.8rem' }} />
        </div>

        {/* Body */}
        <div style={{ padding: '28px 24px 24px' }}>
          {showForgot ? (
            <ForgotView
              email={forgotEmail}
              onEmailChange={setForgotEmail}
              sent={forgotSent}
              loading={isSending}
              onSubmit={handleForgotSubmit}
              onBack={backToLogin}
            />
          ) : (
            <LoginView
              email={email}
              password={password}
              error={error}
              loading={isLoading}
              onEmailChange={setEmail}
              onPasswordChange={setPassword}
              onSubmit={handleSubmit}
              onForgot={() => setShowForgot(true)}
              onClose={onClose}
            />
          )}
        </div>
      </div>
    </>,
    document.body,
  )
}

// ── Login view ─────────────────────────────────────────────────────────────────

function LoginView({
  email, password, error, loading,
  onEmailChange, onPasswordChange, onSubmit, onForgot, onClose,
}: {
  email: string; password: string; error: string | null; loading: boolean
  onEmailChange: (v: string) => void; onPasswordChange: (v: string) => void
  onSubmit: (e: React.FormEvent) => void; onForgot: () => void; onClose: () => void
}) {
  return (
    <>
      <h5 style={{ fontWeight: 700, color: colors.textPrimary, marginBottom: 4, fontSize: '1.2rem' }}>
        Log ind
      </h5>
      <p style={{ fontSize: '0.88rem', color: colors.textSecondary, marginBottom: 20 }}>
        Velkommen tilbage til LaundryBook.
      </p>

      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input
          className="form-control"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          required
          autoComplete="email"
          autoFocus
        />
        <input
          className="form-control"
          type="password"
          placeholder="Adgangskode"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          required
          autoComplete="current-password"
        />
        {error && (
          <p style={{ color: colors.dangerText, margin: 0, fontSize: '0.84rem' }}>{error}</p>
        )}
        <button
          type="submit"
          className="btn fw-semibold"
          style={{
            backgroundColor: colors.primary, color: '#fff',
            border: 'none', borderRadius: 8, padding: '10px', marginTop: 2,
          }}
          disabled={loading}
        >
          {loading ? 'Logger ind…' : 'Log ind'}
        </button>
      </form>

      <button
        className="btn btn-link p-0 mt-3"
        type="button"
        onClick={onForgot}
        style={{ color: colors.textSecondary, fontSize: '0.84rem', textDecoration: 'none' }}
      >
        Glemt adgangskode?
      </button>

      {/* Get-started callout */}
      <div style={{ borderTop: `1px solid ${colors.borderDefault}`, marginTop: 22, paddingTop: 20 }}>
        <p style={{ fontSize: '0.88rem', color: colors.textSecondary, marginBottom: 12, textAlign: 'center' }}>
          Skal jeres forening med på LaundryBook?
        </p>
        <Link
          to="/signup"
          className="btn fw-semibold w-100 text-decoration-none"
          style={{
            backgroundColor: colors.primaryLight,
            color: colors.primary,
            border: `1px solid ${colors.primaryBorder}`,
            borderRadius: 8,
            padding: '10px',
            fontSize: '0.92rem',
            display: 'block',
            textAlign: 'center',
          }}
          onClick={onClose}
        >
          Opret forening
        </Link>
      </div>
    </>
  )
}

// ── Forgot-password view ───────────────────────────────────────────────────────

function ForgotView({
  email, onEmailChange, sent, loading, onSubmit, onBack,
}: {
  email: string; onEmailChange: (v: string) => void
  sent: boolean; loading: boolean
  onSubmit: (e: React.FormEvent) => void; onBack: () => void
}) {
  return (
    <>
      <h5 style={{ fontWeight: 700, color: colors.textPrimary, marginBottom: 4, fontSize: '1.2rem' }}>
        Glemt adgangskode
      </h5>
      {sent ? (
        <>
          <p style={{ fontSize: '0.88rem', color: colors.textSecondary, marginBottom: 20, lineHeight: 1.6 }}>
            Hvis din e-mail er registreret, modtager du snart et link til at nulstille din adgangskode.
          </p>
          <button
            className="btn fw-semibold"
            type="button"
            style={{
              backgroundColor: colors.primaryLight, color: colors.primary,
              border: `1px solid ${colors.primaryBorder}`, borderRadius: 8, padding: '10px 20px',
            }}
            onClick={onBack}
          >
            ← Tilbage til login
          </button>
        </>
      ) : (
        <>
          <p style={{ fontSize: '0.88rem', color: colors.textSecondary, marginBottom: 20 }}>
            Indtast din email, så sender vi dig et nulstillingslink.
          </p>
          <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input
              className="form-control"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              required
              autoComplete="email"
              autoFocus
            />
            <button
              className="btn fw-semibold"
              type="submit"
              style={{ backgroundColor: colors.primary, color: '#fff', border: 'none', borderRadius: 8, padding: '10px' }}
              disabled={loading}
            >
              {loading ? 'Sender…' : 'Send nulstillingslink'}
            </button>
          </form>
          <button
            className="btn btn-link p-0 mt-3"
            type="button"
            onClick={onBack}
            style={{ color: colors.textSecondary, fontSize: '0.84rem', textDecoration: 'none' }}
          >
            ← Tilbage til login
          </button>
        </>
      )}
    </>
  )
}
