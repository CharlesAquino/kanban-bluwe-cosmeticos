import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { FAMILIES_CONFIG, getContainerType } from '@/lib/family-config'

// GET /api/semi-finished/[id]/containers - Lista recipientes de um semi-acabado
export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const semiFinishedId = params.id

    // Buscar recipientes existentes
    const containers = await prisma.packagingContainer.findMany({
      where: { semiFinishedId },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json({ success: true, data: containers })
  } catch (error) {
    console.error('Erro ao buscar recipientes:', error)
    const message = error instanceof Error ? error.message : 'Erro desconhecido'
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor', details: message },
      { status: 500 },
    )
  }
}

// POST /api/semi-finished/[id]/containers - Gera recipientes para um semi-acabado
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { containerType, quantity } = await request.json() as { containerType: string; quantity: number }

    if (!containerType || !quantity || quantity <= 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'containerType e quantity são obrigatórios' 
      }, { status: 400 })
    }

    // Buscar o semi-acabado para validar
    const semiFinished = await prisma.semiFinishedItem.findUnique({
      where: { id: params.id },
    })

    if (!semiFinished) {
      return NextResponse.json({ 
        success: false, 
        error: 'Semi-acabado não encontrado' 
      }, { status: 404 })
    }

    // Validar se o containerType é válido para a família
    const familyContainers = FAMILIES_CONFIG[semiFinished.family]?.containers || []
    const container = familyContainers.find(c => c.id === containerType)
    
    if (!container) {
      return NextResponse.json({ 
        success: false, 
        error: `Tipo de recipiente ${containerType} não é válido para a família ${semiFinished.family}` 
      }, { status: 400 })
    }

    // Gerar recipientes
    const result = await prisma.$transaction(async (tx) => {
      const containers = []
      
      for (let i = 0; i < quantity; i++) {
        const newContainer = await tx.packagingContainer.create({
          data: {
            semiFinishedId: params.id,
            containerType,
            family: semiFinished.family,
            capacityMl: container.capacityMl,
            capacityWeightG: container.capacityWeightG,
            currentQuantity: container.capacityWeightG > 0 ? container.capacityWeightG : container.capacityMl,
            status: 'available',
            batchCode: `${semiFinished.batch}-C${String(i + 1).padStart(3, '0')}`
          }
        })
        containers.push(newContainer)
      }
      
      return containers
    })

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Erro ao gerar recipientes:', error)
    const message = error instanceof Error ? error.message : 'Erro desconhecido'
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor', details: message },
      { status: 500 },
    )
  }
}
