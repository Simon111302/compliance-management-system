const apiUrl = '/api/compliances'

async function request(url, options) {
  const response = await fetch(url, options)

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.message ?? 'Compliance request failed')
  }

  return response.json()
}

export function getCompliances() {
  return request(apiUrl)
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

export function saveReview(complianceId, decision, comments) {
  return request(`${apiUrl}/${complianceId}/review`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ comments, decision }),
  })
}
