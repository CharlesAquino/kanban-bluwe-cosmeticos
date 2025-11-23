import { NextResponse } from 'next/server'

// Mock stats temporário
const mockStats = {
  total: 2,
  inProgress: 1,
  paused: 0,
  completed: 0,
  blocked: 1,
}

export async function GET() {
  try {
    console.log('=== API STATS: Retornando estatísticas mock ===')

    return NextResponse.json({
      success: true,
      data: mockStats
    })
  } catch (error) {
    console.error('=== API STATS: ERRO ===')
    console.error('Erro ao calcular estatísticas:', error)

    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
