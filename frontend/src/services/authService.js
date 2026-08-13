async function request(url, options) {
  const response = await fetch(url, {
    credentials: 'include',
    ...options,
  })

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.message ?? 'Authentication request failed')
  }

  return response.status === 204 ? null : response.json()
}

export function getCurrentUser() {
  return request('/api/auth/me')
}

export function loginUser(email, password) {
  return request('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
}

export function logoutUser() {
  return request('/api/auth/logout', { method: 'POST' })
}
