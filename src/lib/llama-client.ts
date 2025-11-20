/**
 * Cliente Llama para integração com IA
 * Suporta modelos configuráveis e logs detalhados
 */
export interface LlamaResponse {
  success: boolean
  response?: string
  error?: string
  details?: string
}

export interface LlamaOptions {
  model?: string
  temperature?: number
  max_tokens?: number
}

export async function callLlama(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  options: LlamaOptions = {}
): Promise<LlamaResponse> {
  const endpoint = process.env.LLAMA_ENDPOINT

  if (!endpoint) {
    console.error('❌ Llama endpoint not configured. Set LLAMA_ENDPOINT environment variable.')
    return {
      success: false,
      error: 'Llama endpoint not configured',
      details: 'Set LLAMA_ENDPOINT environment variable'
    }
  }

  try {
    console.log('🔗 Calling Llama endpoint:', endpoint)
    console.log('📝 Messages:', messages)
    console.log('⚙️ Options:', options)

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: options.model || 'llama-3.2-3b-instruct',
        messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.max_tokens || 2000,
        stream: false
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Llama API error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      })
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
        details: errorText
      }
    }

    const data = await response.json()
    console.log('✅ Llama response received:', data)

    // Tentar diferentes formatos de resposta
    const responseText = data.choices?.[0]?.message?.content || 
                        data.response || 
                        data.content || 
                        data.text ||
                        JSON.stringify(data)

    return {
      success: true,
      response: responseText
    }

  } catch (error) {
    console.error('❌ Error calling Llama:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.stack : 'No details available'
    }
  }
}
