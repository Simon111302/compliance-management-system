import { useEffect, useState } from 'react'
import {
  getCurrentUser,
  loginUser,
  logoutUser,
} from '../services/authService.js'

export function useAuthController() {
  const [user, setUser] = useState(null)
  const [checkingSession, setCheckingSession] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setCheckingSession(false))
  }, [])

  async function login(event, credentials) {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      setUser(await loginUser(credentials.email.trim(), credentials.password))
    } catch (requestError) {
      setError(requestError.message)
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
