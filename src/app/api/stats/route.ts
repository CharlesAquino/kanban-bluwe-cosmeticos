import { NextResponse } from 'next/server'
import { getStats } from '@/lib/api-fallback'

export async function GET() {
  try {
    console.log('=== API STATS: Calculando estatísticas ===')

    const stats = await getStats()

    console.log('=== API STATS: Estatísticas calculadas:', stats)

    return NextResponse.json({
      success: true,
      data: stats
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
