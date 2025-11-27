import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { diagnoseFillingSystem, generateCodeFixes } from '@/lib/ai-diagnostic'

// POST /api/ai/diagnose - roda diagnóstico IA no servidor
export async function POST(request: NextRequest) {
  try {
    const result = await diagnoseFillingSystem()
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Erro em /api/ai/diagnose:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno no diagnóstico IA',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 },
    )
  }
}

// POST /api/ai/diagnose/fixes - gera correções de código a partir dos issues
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const issues: string[] = body.issues || []

    if (!Array.isArray(issues) || issues.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Lista de problemas (issues) é obrigatória' },
        { status: 400 },
      )
    }

    const fixes = await generateCodeFixes(issues)

    return NextResponse.json({ success: true, data: fixes })
  } catch (error) {
    console.error('Erro em /api/ai/diagnose/fixes:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno ao gerar correções IA',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 },
    )
  }
}
