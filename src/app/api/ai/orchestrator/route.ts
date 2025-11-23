import { NextRequest, NextResponse } from 'next/server'

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

    console.log('🎯 Orchestrator received request (MOCK):', {
      messageCount: messages.length,
      options
    })

    // Mock response for AI orchestrator
    const mockResponse = {
      success: true,
      data: {
        response: 'Este é um sistema mock. Configure OPENAI_API_KEY para funcionalidades reais de IA.',
        provider: 'mock',
        timestamp: new Date().toISOString(),
        tokens: 0
      },
      metadata: {
        model: 'mock-model',
        temperature: options?.temperature || 0.7,
        maxTokens: options?.maxTokens || 1000
      }
    }

    console.log('✅ Orchestrator mock success')
    return NextResponse.json(mockResponse)

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
    message: 'AI Orchestrator API - POST to use (MOCK MODE)',
    version: '1.0.0',
    mode: 'mock',
    endpoints: {
      POST: '/api/ai/orchestrator - Send messages array for AI analysis'
    }
  })
}
