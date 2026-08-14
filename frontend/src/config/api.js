const configuredUrl = import.meta.env.VITE_API_URL?.trim()

export const apiUrl = configuredUrl ? configuredUrl.replace(/\/$/, '') : '/api'
