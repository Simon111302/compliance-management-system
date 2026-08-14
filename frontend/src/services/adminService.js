import { apiUrl } from '../config/api.js'

const adminUrl = `${apiUrl}/admin`

async function request(path, options) {
  const response = await fetch(`${adminUrl}${path}`, {
    credentials: 'include',
    ...options,
  })

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.message ?? 'Admin request failed')
  }

  return response.status === 204 ? null : response.json()
}

function jsonOptions(method, body) {
  return {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }
}

export function getAdminDashboard() {
  return request('/dashboard')
}

export function getUsers() {
  return request('/users')
}

export function createUser(user) {
  return request('/users', jsonOptions('POST', user))
}

export function updateUser(userId, user) {
  return request(`/users/${userId}`, jsonOptions('PUT', user))
}

export function resetUserPassword(userId, password) {
  return request(
    `/users/${userId}/reset-password`,
    jsonOptions('PATCH', { password }),
  )
}

export function deleteUser(userId) {
  return request(`/users/${userId}`, { method: 'DELETE' })
}

export function getReviewerActions() {
  return request('/reviewer-actions')
}

export function createReviewerAction(action) {
  return request('/reviewer-actions', jsonOptions('POST', action))
}

export function updateReviewerAction(actionId, action) {
  return request(`/reviewer-actions/${actionId}`, jsonOptions('PUT', action))
}

export function deleteReviewerAction(actionId) {
  return request(`/reviewer-actions/${actionId}`, { method: 'DELETE' })
}

export function getAuditLogs() {
  return request('/audit-logs')
}
