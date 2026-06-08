import { type FormEvent, useState } from 'react'
import {
  signInWithEmailPassword,
  signUpWithEmailPassword,
  useAuthSession,
} from './lib/auth'
import { TripsDashboard } from './components/TripsDashboard'
import './App.css'

type AuthMode = 'sign-in' | 'sign-up'

function App() {
  const { isLoading, user } = useAuthSession()
  const [authMode, setAuthMode] = useState<AuthMode>('sign-in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [feedback, setFeedback] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleAuthSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFeedback('')
    setIsSubmitting(true)

    try {
      if (authMode === 'sign-in') {
        await signInWithEmailPassword(email, password)
      } else {
        await signUpWithEmailPassword(email, password)
        setFeedback('Check your inbox if email confirmation is enabled.')
      }
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Something went wrong.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <main className="app-shell">
        <section className="auth-panel">
          <p className="eyebrow">Maycation Planner</p>
          <h1>Loading your planner</h1>
        </section>
      </main>
    )
  }

  if (user) {
    return <TripsDashboard user={user} />
  }

  return (
    <main className="app-shell">
      <section className="auth-panel">
        <div>
          <p className="eyebrow">Maycation Planner</p>
          <h1>Plan the trip together</h1>
          <p className="muted">
            Sign in or create an account for the shared family planner.
          </p>
        </div>

        <div className="mode-toggle" aria-label="Choose authentication mode">
          <button
            type="button"
            className={authMode === 'sign-in' ? 'active' : ''}
            onClick={() => setAuthMode('sign-in')}
          >
            Sign in
          </button>
          <button
            type="button"
            className={authMode === 'sign-up' ? 'active' : ''}
            onClick={() => setAuthMode('sign-up')}
          >
            Sign up
          </button>
        </div>

        <form className="auth-form" onSubmit={handleAuthSubmit}>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete={
                authMode === 'sign-in' ? 'current-password' : 'new-password'
              }
              minLength={6}
              required
            />
          </label>

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? 'Working...'
              : authMode === 'sign-in'
                ? 'Sign in'
                : 'Create account'}
          </button>
        </form>

        {feedback ? <p className="feedback">{feedback}</p> : null}
      </section>
    </main>
  )
}

export default App
