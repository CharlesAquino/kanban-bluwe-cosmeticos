/**
 * Verifica e remove produtos totalmente envasados
 * Chamada após operações de envase
 */
import { prisma } from '@/lib/prisma'

export async function checkAndRemoveFullyPackaged(): Promise<{
  removed: number
  updated: number
  details: string[]
}> {
  try {
    const details: string[] = []
    let removed = 0
    let updated = 0

    // Buscar candidatos para remoção/atualização
    const candidates = await prisma.semiFinishedItem.findMany({
      where: {
        status: {
          not: 'QUARENTENA' // Não mexe em quarentena
        }
      }
    })

    for (const item of candidates) {
      const totalKg = Number(item.quantityTotal)
      const envasadoKg = Number(item.quantityEnvasado || 0)

      if (envasadoKg >= totalKg && totalKg > 0) {
        // Produto totalmente envasado - MOVER PARA QUARENTENA
        await prisma.semiFinishedItem.update({
          where: { id: item.id },
          data: { status: 'QUARENTENA' }
        })
        
        updated++
        details.push(`🧠 Enviado para quarentena: ${item.name} (${item.family}) - ${totalKg}kg`)
      } else if (envasadoKg > 0 && item.status === 'AGUARDANDO') {
        // Produto parcialmente envasado - atualizar status
        await prisma.semiFinishedItem.update({
          where: { id: item.id },
          data: { status: 'ENVIASANDO' }
        })
        
        updated++
        details.push(`🔄 Atualizado: ${item.name} - ${envasadoKg}/${totalKg}kg envasado`)
      }
    }

    return { removed: 0, updated, details }
  } catch (error) {
    console.error('Erro na verificação automática:', error)
    return { removed: 0, updated: 0, details: [] }
  }
}
