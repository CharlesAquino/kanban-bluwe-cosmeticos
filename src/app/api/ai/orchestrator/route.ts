import { NextRequest, NextResponse } from 'next/server'
import { callAIWithFallback, type AIMessage } from '@/lib/ai-client'
import { apiLog, apiError } from '@/lib/api-logger'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { messages, options } = body

    // Validação de entrada
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { success: false, error: 'Messages array is required' },
        { status: 400 }
      )
    }

    apiLog('🎯 AI Orchestrator request', {
      messageCount: messages.length,
      provider: options?.provider,
      model: options?.model
    })

    // Chamar IA real com fallback automático
    const result = await callAIWithFallback(messages as AIMessage[], options)

    if (!result.success) {
      apiError('❌ AI Orchestrator failed', new Error(result.error || 'Unknown AI error'), {
        provider: options?.provider,
        details: result.details
      })

      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to get AI response',
          details: result.details,
          fallbackAttempted: true
        },
        { status: 500 }
      )
    }

    apiLog('✅ AI Orchestrator success', {
      provider: result.provider,
      model: result.model,
      responseLength: result.content?.length || 0
    })

    return NextResponse.json({
      success: true,
      data: {
        response: result.content,
        provider: result.provider,
        model: result.model,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    apiError('❌ AI Orchestrator unexpected error', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : 'No details available'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  // Verificar quais providers estão configurados
  const { checkAvailableProviders } = await import('@/lib/ai-client')
  const available = await checkAvailableProviders()

  return NextResponse.json({
    message: 'AI Orchestrator API - Real AI with automatic fallback',
    version: '2.0.0',
    mode: 'production',
    availableProviders: available,
    endpoints: {
      POST: '/api/ai/orchestrator - Send messages array for AI analysis'
    },
    usage: {
      example: {
        messages: [
          { role: 'system', content: 'You are a helpful assistant' },
          { role: 'user', content: 'Hello!' }
        ],
        options: {
          provider: 'openai',  // Optional: 'openai' | 'llama'
          model: 'gpt-3.5-turbo',  // Optional
          temperature: 0.7  // Optional
        }
      }
    }
  })
}
