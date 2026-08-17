import { useState } from 'react'
import type { FormEvent } from 'react'
import './Login.css'

interface LoginCredentials {
  email: string
  password: string
}

interface LoginProps {
  error: string
  onSubmit: (
    event: FormEvent<HTMLFormElement>,
    credentials: LoginCredentials,
  ) => void
  submitting: boolean
}

export function Login({ error, onSubmit, submitting }: LoginProps) {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
  })

  function updateField(
    field: keyof LoginCredentials,
    value: LoginCredentials[keyof LoginCredentials],
  ) {
    setCredentials((current) => ({ ...current, [field]: value }))
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <p className="login-eyebrow">Compliance</p>
        <h1>Sign In</h1>
        <p className="login-description">
          Sign in to access your compliance workspace.
        </p>

        <form onSubmit={(event) => onSubmit(event, credentials)}>
          <label className="login-field">
            <span>Email</span>
            <input
              autoComplete="email"
              type="email"
              value={credentials.email}
              onChange={(event) => updateField('email', event.target.value)}
              required
            />
          </label>

          <label className="login-field">
            <span>Password</span>
            <input
              autoComplete="current-password"
              type="password"
              value={credentials.password}
              onChange={(event) => updateField('password', event.target.value)}
              required
            />
          </label>

          {error && <p className="login-error">{error}</p>}

          <button
            className="login-button"
            type="submit"
            disabled={submitting}
          >
            {submitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </section>
    </main>
  )
}
