/**
 * Slack MCP Integration
 * 
 * Envia notificações formatadas para Slack
 */

export interface SlackNotification {
  message: string
  channel?: string
  username?: string
  icon?: string
  attachments?: SlackAttachment[]
}

export interface SlackAttachment {
  title: string
  text: string
  color?: 'good' | 'warning' | 'danger'
  fields?: { title: string; value: string; short?: boolean }[]
}

/**
 * Envia notificação para Slack
 */
export async function sendNotification(notification: SlackNotification): Promise<void> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL

  if (!webhookUrl) {
    console.warn('⚠️ SLACK_WEBHOOK_URL não configurado - notificação ignorada')
    return
  }

  try {
    const payload = {
      text: notification.message,
      channel: notification.channel ? `#${notification.channel}` : undefined,
      username: notification.username || 'Kanban Testing Bot',
      icon_emoji: notification.icon || ':robot_face:',
      attachments: notification.attachments
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      throw new Error(`Slack API error: ${response.statusText}`)
    }

    console.log('✅ Slack notification sent successfully')

  } catch (error) {
    console.error('❌ Failed to send Slack notification:', error)
    throw error
  }
}

/**
 * Envia notificação de teste com formatação rica
 */
export async function sendTestResultNotification(params: {
  suiteName: string
  total: number
  passed: number
  failed: number
  duration: number
  aiConfidence: number
  aiAssessment: string
}): Promise<void> {
  const { suiteName, total, passed, failed, duration, aiConfidence, aiAssessment } = params

  const passRate = ((passed / total) * 100).toFixed(1)
  const status = failed === 0 ? 'good' : failed < 3 ? 'warning' : 'danger'
  const emoji = failed === 0 ? '✅' : '⚠️'

  await sendNotification({
    message: `${emoji} *Test Suite: ${suiteName}*`,
    channel: 'qa-reports',
    attachments: [
      {
        title: 'Test Results',
        text: aiAssessment,
        color: status,
        fields: [
          { title: 'Total Tests', value: String(total), short: true },
          { title: 'Passed', value: String(passed), short: true },
          { title: 'Failed', value: String(failed), short: true },
          { title: 'Pass Rate', value: `${passRate}%`, short: true },
          { title: 'Duration', value: `${(duration / 1000).toFixed(1)}s`, short: true },
          { title: 'AI Confidence', value: `${(aiConfidence * 100).toFixed(0)}%`, short: true }
        ]
      }
    ]
  })
}
