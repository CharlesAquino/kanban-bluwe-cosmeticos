import { NextRequest, NextResponse } from 'next/server'
import { callAIWithFallback } from '@/lib/ai-client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { messages, options } = body

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { success: false, error: 'Messages array is required' },
        { status: 400 }
      )
    }

    console.log('🎯 Orchestrator received request:', { 
      messageCount: messages.length, 
      options 
    })

    // Usar AI client genérico com fallback entre múltiplos provedores
    const result = await callAIWithFallback(messages, options)

    if (!result.success) {
      console.error('❌ Orchestrator error:', result.error)
      return NextResponse.json(result, { status: 500 })
    }

    console.log('✅ Orchestrator success')
    return NextResponse.json(result)

  } catch (error) {
    console.error('❌ Orchestrator unexpected error:', error)
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
  return NextResponse.json({ 
    message: 'AI Orchestrator API - POST to use',
    version: '1.0.0',
    endpoints: {
      POST: '/api/ai/orchestrator - Send messages array for AI analysis'
    }
  })
}
