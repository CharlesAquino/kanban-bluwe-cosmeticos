import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    console.log('=== LIMPEZA AUTOMÁTICA: Verificando produtos totalmente envasados ===')
    
    // Buscar todos os semi-acabados que podem ser removidos
    const candidates = await prisma.semiFinishedItem.findMany({
      where: {
        // Não está em quarentena (só remove produtos disponíveis)
        status: {
          not: 'QUARENTENA'
        }
      }
    })

    console.log(`📊 Encontrados ${candidates.length} candidatos para verificação`)

    const toRemove: string[] = []
    const updated: string[] = []

    for (const item of candidates) {
      const totalKg = Number(item.quantityTotal)
      const envasadoKg = Number(item.quantityEnvasado || 0)
      
      // Se foi totalmente envasado (ou excedeu) - MOVER PARA QUARENTENA
      if (envasadoKg >= totalKg && totalKg > 0) {
        console.log(`✅ Produto pronto para quarentena: ${item.name} (${item.family})`)
        console.log(`   Total: ${totalKg}kg, Envasado: ${envasadoKg}kg`)
        
        // Atualizar para QUARENTENA em vez de remover
        await prisma.semiFinishedItem.update({
          where: { id: item.id },
          data: { status: 'QUARENTENA' }
        })
        
        updated.push(item.id)
      } else if (envasadoKg > 0 && envasadoKg < totalKg) {
        // Se foi parcialmente envasado, marcar como ENVIASANDO
        if (item.status !== 'ENVIASANDO') {
          await prisma.semiFinishedItem.update({
            where: { id: item.id },
            data: { status: 'ENVIASANDO' }
          })
          updated.push(item.id)
          console.log(`🔄 Atualizado para ENVIASANDO: ${item.name}`)
        }
      }
    }

    console.log(`🧹 LIMPEZA CONCLUÍDA:`)
    console.log(`   Enviados para quarentena: ${updated.filter(id => 
      candidates.find(item => item.id === id)?.status === 'QUARENTENA'
    ).length} produtos`)
    console.log(`   Atualizados para ENVIASANDO: ${updated.filter(id => 
      candidates.find(item => item.id === id)?.status === 'ENVIASANDO'
    ).length} produtos`)
    console.log(`   Total processados: ${candidates.length}`)

    return NextResponse.json({
      success: true,
      data: {
        processed: candidates.length,
        sentToQuarantine: updated.filter(id => 
          candidates.find(item => item.id === id)?.status === 'QUARENTENA'
        ).length,
        markedAsPackaging: updated.filter(id => 
          candidates.find(item => item.id === id)?.status === 'ENVIASANDO'
        ).length,
        updatedIds: updated
      }
    })

  } catch (error) {
    console.error('❌ Erro na limpeza automática:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      details: error instanceof Error ? error.stack : 'Sem detalhes'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'API de limpeza automática de semi-acabados',
    usage: 'POST para executar verificação',
    behavior: 'Move produtos totalmente envasados para QUARENTENA e atualiza parcialmente envasados para ENVIASANDO',
    flow: 'AGUARDANDO → ENVIASANDO → QUARENTENA → FINALIZADO'
  })
}
