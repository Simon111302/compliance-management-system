import { apiUrl as apiBaseUrl } from '../config/api.js'

const apiUrl = `${apiBaseUrl}/compliances`

async function request(url, options) {
  const response = await fetch(url, {
    credentials: 'include',
    ...options,
  })

  if (!response.ok) {
    const contentType = response.headers.get('content-type') ?? ''
    const body = contentType.includes('application/json')
      ? await response.json().catch(() => ({}))
      : {}

    if (response.status === 404 && url.endsWith('/submission')) {
      throw new Error(
        'The API server is out of date. Restart the backend server.',
      )
    }

    throw new Error(
      body.message ?? `Compliance request failed (${response.status})`,
    )
  }

  return response.json()
}

export function getCompliances() {
  return request(apiUrl)
}

export function getReporters() {
  return request(`${apiUrl}/reporters`)
}

export function addCompliance(compliance) {
  return request(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(compliance),
  })
}

export function saveCompliance(compliance) {
  return request(`${apiUrl}/${compliance.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(compliance),
  })
}

export function uploadComplianceEvidence(complianceId, file) {
  return request(`${apiUrl}/${complianceId}/evidence`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/octet-stream',
      'X-File-Name': encodeURIComponent(file.name),
      'X-File-Type': file.type,
    },
    body: file,
  })
}

export function evidenceUrl(complianceId, fileId) {
  return `${apiUrl}/${complianceId}/evidence/${fileId}`
}

export function submitComplianceForm(complianceId, submission) {
  return request(`${apiUrl}/${complianceId}/submission`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(submission),
  })
}

export function saveReview(complianceId, decision, comments) {
  return request(`${apiUrl}/${complianceId}/review`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ comments, decision }),
  })
}
