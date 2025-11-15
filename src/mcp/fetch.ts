export async function logInfo(tag: string, payload: unknown) {
  try {
    await new Promise((r) => setTimeout(r, 50))
    console.log(`[MCP:fetch] ${tag}:`, payload)
    return { ok: true }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}
