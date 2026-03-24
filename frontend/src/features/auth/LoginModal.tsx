import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { firebaseAuth } from '../../lib/firebase'
import { useLoginMutation, useForgotPasswordMutation } from './authApi'
import { ModalShell } from '../../shared/modals/ModalShell'

interface LoginModalProps {
  onClose: () => void
}

export function LoginModal({ onClose }: LoginModalProps) {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const [showForgot, setShowForgot] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotSent, setForgotSent] = useState(false)

  const [login, { isLoading }] = useLoginMutation()
  const [forgotPassword, { isLoading: isSendingReset }] = useForgotPasswordMutation()

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
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Login mislykkedes. Prøv igen.')
      }
    }
  }

  async function handleForgotSubmit(e: React.FormEvent) {
    e.preventDefault()
    await forgotPassword({ email: forgotEmail }).unwrap()
    setForgotSent(true)
  }

  if (showForgot) {
    return (
      <ModalShell title="Glemt adgangskode" onClose={onClose} size="sm">
        {forgotSent ? (
          <>
            <p style={{ margin: '0 0 16px' }}>
              Hvis din e-mail er registreret, modtager du snart et link.
            </p>
            <button
              className="btn btn-secondary"
              type="button"
              onClick={() => { setShowForgot(false); setForgotSent(false); setForgotEmail('') }}
            >
              ← Tilbage til login
            </button>
          </>
        ) : (
          <>
            <form onSubmit={handleForgotSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input
                className="form-control"
                type="email"
                placeholder="Email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required
                autoComplete="email"
                autoFocus
              />
              <button className="btn btn-primary fw-semibold" type="submit" disabled={isSendingReset}>
                {isSendingReset ? 'Sender…' : 'Send nulstillingslink'}
              </button>
            </form>
            <button
              className="btn btn-link p-0 mt-2"
              type="button"
              onClick={() => setShowForgot(false)}
            >
              ← Tilbage til login
            </button>
          </>
        )}
      </ModalShell>
    )
  }

  return (
    <ModalShell title="Log ind" onClose={onClose} size="sm">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input
          className="form-control"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          autoFocus
        />
        <input
          className="form-control"
          type="password"
          placeholder="Adgangskode"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
        {error && <p style={{ color: '#dc3545', margin: 0, fontSize: 14 }}>{error}</p>}
        <button className="btn btn-primary fw-semibold" type="submit" disabled={isLoading}>
          {isLoading ? 'Logger ind…' : 'Log ind'}
        </button>
      </form>
      <button
        className="btn btn-link p-0 mt-2"
        type="button"
        onClick={() => setShowForgot(true)}
        style={{ fontSize: 14 }}
      >
        Glemt adgangskode?
      </button>
    </ModalShell>
  )
}
