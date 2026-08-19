const configuredUrl = import.meta.env.VITE_API_URL?.trim()

function normalizeApiUrl(url: string | undefined): string {
  if (!url) return '/v1'

  const normalizedUrl = url.replace(/\/$/, '')
  return normalizedUrl.endsWith('/v1') ? normalizedUrl : `${normalizedUrl}/v1`
}

export const apiUrl = normalizeApiUrl(configuredUrl)

export class ApiRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
    this.name = 'ApiRequestError'
  }
}

export async function apiRequest<T>(
  path: string,
  options?: RequestInit,
  fallbackMessage = 'API request failed',
): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, {
    credentials: 'include',
    ...options,
  })

  if (!response.ok) {
    const contentType = response.headers.get('content-type') ?? ''
    const body = contentType.includes('application/json')
      ? ((await response.json().catch(() => ({}))) as { message?: string })
      : {}
    throw new ApiRequestError(body.message ?? fallbackMessage, response.status)
  }

  return (response.status === 204 ? null : response.json()) as Promise<T>
}

export function jsonOptions(method: string, body: unknown): RequestInit {
  return {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }
}
