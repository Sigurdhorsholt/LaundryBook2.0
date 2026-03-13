import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { firebaseAuth } from '../lib/firebase'
import { useLoginMutation, useMeQuery } from '../features/auth/authApi'

export function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const [login, { isLoading }] = useLoginMutation()

  // If already authenticated, skip the login page
  const { data: user, isLoading: isCheckingSession } = useMeQuery()
  if (isCheckingSession) return null
  if (user) return <Navigate to="/dashboard" replace />

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    try {
      const credential = await signInWithEmailAndPassword(firebaseAuth, email, password)
      const idToken = await credential.user.getIdToken()
      await login({ idToken }).unwrap()
      navigate('/dashboard', { replace: true })
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Login failed. Please try again.')
      }
    }
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div style={{ width: 320 }}>
        <h1 style={{ marginBottom: 24 }}>LaundryBook</h1>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          {error && <p style={{ color: 'red', margin: 0, fontSize: 14 }}>{error}</p>}
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
