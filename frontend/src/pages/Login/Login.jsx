import { useState } from 'react'
import './Login.css'

export function Login({ error, onSubmit, submitting }) {
  const [credentials, setCredentials] = useState({ email: '', password: '' })

  function updateField(field, value) {
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
