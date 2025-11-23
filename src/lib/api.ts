/**
 * API utilities - Temporário
 */

export const apiFetch = async (url: string, options?: RequestInit) => {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  })

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`)
  }

  return response.json()
}

export const api = {
  get: (url: string) => apiFetch(url),
  post: (url: string, data: any) => apiFetch(url, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  put: (url: string, data: any) => apiFetch(url, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  patch: (url: string, data: any) => apiFetch(url, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  delete: (url: string) => apiFetch(url, {
    method: 'DELETE',
  }),
}
