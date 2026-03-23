import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { firebaseAuth } from '../../lib/firebase'
import { useLoginMutation } from './authApi'
import { ModalShell } from '../../shared/modals/ModalShell'

interface LoginModalProps {
  onClose: () => void
}

export function LoginModal({ onClose }: LoginModalProps) {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const [login, { isLoading }] = useLoginMutation()

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
    </ModalShell>
  )
}
