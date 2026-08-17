import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { getCurrentUser, loginUser, logoutUser } from '../services/auth.service'
import { getErrorMessage } from '../types'
import type { AuthUser } from '../types'

interface LoginCredentials {
  email: string
  password: string
}

export function useAuthController() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [checkingSession, setCheckingSession] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setCheckingSession(false))
  }, [])

  async function login(
    event: FormEvent<HTMLFormElement>,
    credentials: LoginCredentials,
  ) {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      setUser(await loginUser(credentials.email.trim(), credentials.password))
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Authentication request failed'))
    } finally {
      setSubmitting(false)
    }
  }

  async function logout() {
    await logoutUser()
    setUser(null)
  }

  return {
    checkingSession,
    error,
    login,
    logout,
    submitting,
    user,
  }
}
