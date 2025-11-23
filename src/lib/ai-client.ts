/**
 * Cliente IA Genérico com Fallback
 * Suporta múltiplos provedores: OpenAI, Anthropic, Gemini, Groq, Llama
 */

export interface AIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface AIOptions {
  model?: string
  temperature?: number
  maxTokens?: number
  provider?: 'openai' | 'anthropic' | 'gemini' | 'groq' | 'llama'
}

export interface AIResult {
  success: boolean
  content?: string
  provider?: string
  model?: string
  error?: string
  details?: string
}

/**
 * Cliente OpenAI
 */
async function callOpenAI(messages: AIMessage[], options: AIOptions): Promise<AIResult> {
  try {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return { success: false, error: 'OPENAI_API_KEY não configurada' }
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: options.model || 'gpt-3.5-turbo',
        messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 1000,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      return { success: false, error: `OpenAI API error: ${error}` }
    }

    const data = await response.json()
    return {
      success: true,
      content: data.choices[0]?.message?.content || '',
      provider: 'openai',
      model: data.model,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido no OpenAI',
    }
  }
}

/**
 * Cliente Llama (fallback local)
 */
async function callLlama(messages: AIMessage[], options: AIOptions): Promise<AIResult> {
  try {
    const { callLlama } = await import('./llama-client')
    return await callLlama(messages, options)
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido no Llama',
    }
  }
}

/**
 * Cliente IA com Fallback Automático
 * Tenta múltiplos provedores em ordem de preferência
 */
export async function callAIWithFallback(
  messages: AIMessage[],
  options: AIOptions = {}
): Promise<AIResult> {
  console.log('🤖 Iniciando chamada IA com fallback...')
  
  // Ordem de preferência dos provedores
  const providers = [
    { name: 'openai', fn: callOpenAI },
    { name: 'llama', fn: callLlama },
  ]

  // Se provider específico for solicitado, tenta só ele
  if (options.provider) {
    const provider = providers.find(p => p.name === options.provider)
    if (provider) {
      console.log(`🎯 Tentando provedor específico: ${provider.name}`)
      const result = await provider.fn(messages, options)
      if (result.success) {
        console.log(`✅ Sucesso com ${provider.name}:`, result.model)
        return result
      }
      console.error(`❌ Falha com ${provider.name}:`, result.error)
      return result
    }
  }

  // Tentar provedores em ordem de preferência
  for (const provider of providers) {
    try {
      console.log(`🔄 Tentando provedor: ${provider.name}`)
      const result = await provider.fn(messages, options)
      
      if (result.success) {
        console.log(`✅ Sucesso com ${provider.name}:`, result.model)
        return result
      }
      
      console.warn(`⚠️ Falha com ${provider.name}:`, result.error)
    } catch (error) {
      console.error(`❌ Erro crítico com ${provider.name}:`, error)
    }
  }

  return {
    success: false,
    error: 'Todos os provedores IA falharam',
    details: `Tentados: ${providers.map(p => p.name).join(', ')}`,
  }
}

/**
 * Verifica quais provedores estão disponíveis
 */
export async function checkAvailableProviders(): Promise<string[]> {
  const providers: string[] = []
  
  if (process.env.OPENAI_API_KEY) {
    providers.push('openai')
  }
  
  if (process.env.LLAMA_ENDPOINT) {
    providers.push('llama')
  }
  
  return providers
}
