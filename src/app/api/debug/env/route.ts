import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Debug endpoint para verificar variáveis de ambiente
export async function GET() {
  return NextResponse.json({
    environment: process.env.NODE_ENV,
    availableProviders: {
      openai: !!process.env.OPENAI_API_KEY,
      anthropic: !!process.env.ANTHROPIC_API_KEY,
      gemini: !!process.env.GEMINI_API_KEY,
      groq: !!process.env.GROQ_API_KEY,
      llama: !!process.env.LLAMA_ENDPOINT
    },
    envKeys: {
      // Apenas mostrar se existem (sem mostrar valores)
      OPENAI_API_KEY: process.env.OPENAI_API_KEY ? 'SET' : 'NOT_SET',
      GROQ_API_KEY: process.env.GROQ_API_KEY ? 'SET' : 'NOT_SET',
      ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY ? 'SET' : 'NOT_SET',
      GEMINI_API_KEY: process.env.GEMINI_API_KEY ? 'SET' : 'NOT_SET',
      LLAMA_ENDPOINT: process.env.LLAMA_ENDPOINT ? 'SET' : 'NOT_SET'
    }
  })
}
