import { type FormEvent, useState } from 'react'
import {
  signInWithEmailPassword,
  signUpWithEmailPassword,
  useAuthSession,
} from './lib/auth'
import { Button, CardSurface, FeedbackMessage, TextInput } from './components/DesignSystem'
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
        <CardSurface className="auth-panel">
          <img src="/wordmark-white.png" alt="Maycation" className="auth-wordmark" />
        </CardSurface>
      </main>
    )
  }

  if (user) {
    return <TripsDashboard />
  }

  return (
    <main className="app-shell">
      <CardSurface className="auth-panel">
        <img src="/wordmark-white.png" alt="Maycation" className="auth-wordmark" />

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
          <TextInput
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            autoComplete="email"
            required
          />

          <TextInput
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            autoComplete={
              authMode === 'sign-in' ? 'current-password' : 'new-password'
            }
            minLength={6}
            required
          />

          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting
              ? 'Working...'
              : authMode === 'sign-in'
                ? 'Sign in'
                : 'Create account'}
          </Button>
        </form>

        {feedback ? <FeedbackMessage>{feedback}</FeedbackMessage> : null}
      </CardSurface>
    </main>
  )
}

export default App
