import type { AgentEvent } from './dispatcher'

// Minimal NeuralAgent with safe stubs
async function validateVisual(payload: Record<string, unknown>) {
  try {
    const { screenshot } = await import('../mcp/playwright')
    await screenshot({ url: 'http://localhost:3001/semi-finished', name: 'semi-finished' })
  } catch (e) {
    // noop
  }
}

async function recordMetric(payload: Record<string, unknown>) {
  // stub metric (could send to timeseries later)
  try {
    const { logInfo } = await import('../mcp/fetch')
    await logInfo('metric', payload)
  } catch {}
}

async function notify(payload: Record<string, unknown>) {
  try {
    const { sendNotification } = await import('../mcp/slack')
    await sendNotification({ message: `Balde devolvido: ${JSON.stringify(payload)}`, channel: 'kanban-alerts' })
  } catch {}
}

export async function handle(event: AgentEvent) {
  try {
    if (event.type === 'finalize') {
      await validateVisual(event.payload)
    } else if (event.type === 'package') {
      await recordMetric(event.payload)
    } else if (event.type === 'return') {
      await notify(event.payload)
    }
  } catch (e) {
    // never throw
  }
}
