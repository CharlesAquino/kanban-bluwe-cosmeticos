export async function sendNotification({ message, channel }: { message: string; channel?: string }) {
  const webhook = process.env.SLACK_WEBHOOK

  // Se não tiver webhook válido, simula
  if (!webhook || webhook.includes('hooks.slack.com/...')) {
    await new Promise((r) => setTimeout(r, 80))
    console.log(`[MCP:slack] sendNotification SIMULADO: ${message.slice(0, 100)}... ${channel ? '(#' + channel + ')' : ''}`)
    return { ok: true }
  }

  try {
    // Integração real com Slack Webhook
    const payload: any = {
      text: message,
      mrkdwn: true,
    }

    // Se especificou canal, adiciona ao payload
    if (channel) {
      payload.channel = channel.startsWith('#') ? channel : `#${channel}`
    }

    const response = await fetch(webhook, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Slack API error: ${response.status} - ${error}`)
    }

    console.log(`[MCP:slack] sendNotification REAL: ${message.slice(0, 50)}... ${channel ? '(#' + channel + ')' : ''}`)
    return { ok: true }
  } catch (error) {
    console.error('[MCP:slack] Error sending notification:', error)
    return { ok: false, error: String(error) }
  }
}
