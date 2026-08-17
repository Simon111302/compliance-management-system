import { apiRequest, jsonOptions } from '../config/api'
import type { AuthUser } from '../types'

export function getCurrentUser(): Promise<AuthUser> {
  return apiRequest('/auth/me', undefined, 'Authentication request failed')
}

export function loginUser(email: string, password: string): Promise<AuthUser> {
  return apiRequest(
    '/auth/login',
    jsonOptions('POST', { email, password }),
    'Authentication request failed',
  )
}

export function logoutUser(): Promise<null> {
  return apiRequest(
    '/auth/logout',
    { method: 'POST' },
    'Authentication request failed',
  )
}
