export type ApiFetchOptions = RequestInit & {
  timeoutMs?: number
  retries?: number
  retryDelayMs?: number
}

export async function apiFetch<T = unknown>(url: string, options: ApiFetchOptions = {}): Promise<T> {
  const { timeoutMs = 30000, retries = 2, retryDelayMs = 1000, ...init } = options

  let attempt = 0
  const wait = (ms: number) => new Promise((res) => setTimeout(res, ms))

  while (true) {
    const controller = new AbortController()
    const id = setTimeout(() => controller.abort(new Error('Request Timeout')), timeoutMs)
    try {
      const res = await fetch(url, { ...init, signal: controller.signal })
      clearTimeout(id)

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
      clearTimeout(id)
      attempt += 1

      const isAbort = err instanceof Error && (err.name === 'AbortError' || err.message === 'Request Timeout')
      // Se foi abortado por timeout, conta como erro retentável. Se foi abortado pelo usuário (navegação), talvez não devesse.
      // Aqui assumimos que o abort interno é timeout.

      if (attempt > retries) throw err

      console.warn(`⚠️ apiFetch attempt ${attempt} failed for ${url}:`, err)
      const delay = retryDelayMs * Math.pow(2, attempt - 1) + Math.floor(Math.random() * 100)
      await wait(delay)
    }
  }
}
