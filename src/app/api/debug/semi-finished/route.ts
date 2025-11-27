import { NextRequest, NextResponse } from 'next/server'
import { semiFinishedQueries } from '@/lib/db/queries/semi-finished'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const family = searchParams.get('family')

    console.log('=== DEBUG: Verificando produtos semi-acabados ===')
    console.log('Filtro family:', family)

    let items = await semiFinishedQueries.getAll()

    if (family) {
      items = items.filter(
        (item) =>
          item.family &&
          item.family.toLowerCase().includes(family.toLowerCase())
      )
    }

    console.log(`📊 Encontrados ${items.length} produtos`)

    const details = items.map((item) => ({
      id: item.id,
      name: item.name,
      family: item.family,
      status: item.status,
      totalKg: Number(item.quantityTotal),
      envasadoKg: Number(item.quantityEnvasado || 0),
      percentEnvasado:
        item.quantityTotal > 0
          ? Math.round(
              (Number(item.quantityEnvasado || 0) / Number(item.quantityTotal)) *
                100
            )
          : 0,
      op: item.op,
      batch: item.batch,
      shouldBeInQuarantine:
        Number(item.quantityEnvasado || 0) >= Number(item.quantityTotal) &&
        Number(item.quantityTotal) > 0,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }))

    // Análise específica
    const gelConstrutor = details.find(
      (item) =>
        item.family?.toLowerCase().includes('gel') &&
        item.name?.toLowerCase().includes('construtor')
    )

    if (gelConstrutor) {
      console.log('🎯 PRODUTO "GEL CONSTRUTOR" ENCONTRADO:')
      console.log(`   Status: ${gelConstrutor.status}`)
      console.log(`   Total: ${gelConstrutor.totalKg}kg`)
      console.log(`   Envasado: ${gelConstrutor.envasadoKg}kg`)
      console.log(`   Percentual: ${gelConstrutor.percentEnvasado}%`)
      console.log(
        `   Deveria estar em quarentena: ${gelConstrutor.shouldBeInQuarantine}`
      )
      console.log(`   ID: ${gelConstrutor.id}`)
    }

    return NextResponse.json({
      success: true,
      data: {
        total: items.length,
        items: details,
        analysis: {
          gelConstrutor: gelConstrutor || null,
          readyForQuarantine: details.filter(
            (item) => item.shouldBeInQuarantine && item.status !== 'QUARENTENA'
          ),
          inQuarantine: details.filter((item) => item.status === 'QUARENTENA'),
          needsPackaging: details.filter(
            (item) => item.envasadoKg > 0 && item.envasadoKg < item.totalKg
          ),
        },
      },
    })
  } catch (error) {
    console.error('❌ Erro no debug:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    )
  }
}
