export type ApiFetchOptions = RequestInit & {
  timeoutMs?: number
  retries?: number
  retryDelayMs?: number
}

export async function apiFetch<T = unknown>(url: string, options: ApiFetchOptions = {}): Promise<T> {
  const { timeoutMs = 10000, retries = 2, retryDelayMs = 500, ...init } = options

  let attempt = 0
  // Simple exponential backoff with jitter
  const wait = (ms: number) => new Promise((res) => setTimeout(res, ms))

  while (true) {
    const controller = new AbortController()
    const id = setTimeout(() => controller.abort(), timeoutMs)
    try {
      const res = await fetch(url, { ...init, signal: controller.signal })
      const ct = res.headers.get('content-type') || ''
      const isJson = ct.includes('application/json')
      const data: unknown = isJson ? await res.json() : await res.text()
      if (!res.ok) {
        const err = isJson && typeof data === 'object' && data && 'error' in data
          ? String((data as Record<string, unknown>).error)
          : `HTTP ${res.status}`
        throw new Error(err)
      }
      return data as T
    } catch (err) {
      attempt += 1
      if (attempt > retries) throw err
      const delay = retryDelayMs * Math.pow(2, attempt - 1) + Math.floor(Math.random() * 100)
      await wait(delay)
    } finally {
      clearTimeout(id)
    }
  }
}
