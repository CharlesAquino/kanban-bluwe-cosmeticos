// Simple cross-tab/channel sync using BroadcastChannel with fallback
export type ChangeEvent = {
  type: 'products' | 'semi_finished'
  action: string
  timestamp: number
}

const channelName = 'kanban-sync'

export function broadcastChange(event: Omit<ChangeEvent, 'timestamp'>) {
  try {
    const payload: ChangeEvent = { ...event, timestamp: Date.now() }
    if ('BroadcastChannel' in globalThis) {
      const ch = new BroadcastChannel(channelName)
      ch.postMessage(payload)
      ch.close()
    } else if ('localStorage' in globalThis) {
      localStorage.setItem(`bc:${channelName}`, JSON.stringify(payload))
      setTimeout(() => localStorage.removeItem(`bc:${channelName}`), 2000)
    }
  } catch {
    // ignore
  }
}

export function subscribeChanges(handler: (ev: ChangeEvent) => void) {
  let lsHandler: ((e: StorageEvent) => void) | null = null
  let bc: BroadcastChannel | null = null

  try {
    if ('BroadcastChannel' in globalThis) {
      bc = new BroadcastChannel(channelName)
      bc.onmessage = (e) => handler(e.data as ChangeEvent)
      return () => {
        if (bc) bc.onmessage = null
        if (bc) bc.close()
      }
    }
  } catch {
    // ignore
  }

  if ('addEventListener' in globalThis && 'localStorage' in globalThis) {
    lsHandler = (e: StorageEvent) => {
      if (e.key === `bc:${channelName}` && e.newValue) {
        try {
          handler(JSON.parse(e.newValue))
        } catch {
          // ignore
        }
      }
    }
    window.addEventListener('storage', lsHandler)
    return () => {
      if (lsHandler) window.removeEventListener('storage', lsHandler)
    }
  }

  return () => {}
}
