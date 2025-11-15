export async function chatCompletion({ messages, model = 'gpt-3.5-turbo', maxTokens = 1000 }: {
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>
  model?: string
  maxTokens?: number
}) {
  const apiKey = process.env.OPENAI_API_KEY

  // Se não tiver chave, retorna resposta hardcoded
  if (!apiKey) {
    console.log('[MCP:openai] chatCompletion SIMULADO')
    return { response: 'Resposta simulada: Configure OPENAI_API_KEY para respostas inteligentes.' }
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: maxTokens,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    console.log('[MCP:openai] chatCompletion REAL')
    return { response: data.choices[0]?.message?.content || 'Erro na resposta' }
  } catch (error) {
    console.error('[MCP:openai] Error:', error)
    return { response: 'Erro ao conectar com OpenAI. Verifique sua chave API.' }
  }
}
