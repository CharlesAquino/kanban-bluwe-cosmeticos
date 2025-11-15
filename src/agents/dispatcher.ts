// Simple in-memory dispatcher queue (no external deps)
export type AgentEvent = {
  type: 'finalize' | 'package' | 'return'
  payload: Record<string, any>
}

const queue: AgentEvent[] = []
let running = false

export async function enqueue(event: AgentEvent) {
  queue.push(event)
  if (!running) run()
}

async function run() {
  running = true
  while (queue.length) {
    const ev = queue.shift()!
    try {
      const agent = await import('./neural-agent')
      await agent.handle(ev)
    } catch (e) {
      console.warn('[Dispatcher] Agent error:', e)
    }
  }
  running = false
}
