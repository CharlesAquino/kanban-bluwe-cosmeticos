import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'

// GET /api/quarantine - Lista itens em quarentena
export async function GET() {
  try {
    const items = await prisma.semiFinishedItem.findMany({
      where: {
        status: 'QUARENTENA' // Apenas produtos em quarentena
      },
      orderBy: { updatedAt: 'desc' },
    })

    // Transformar camelCase do Prisma para snake_case do frontend
    const transformedItems = items.map((item: any) => ({
      ...item,
      quantity_total: item.quantityTotal,
      quantity_envasado: item.quantityEnvasado,
      manufacturingDate: item.manufacturingDate,
      created_at: item.createdAt,
      updated_at: item.updatedAt,
    }))

    return NextResponse.json({ success: true, data: transformedItems })
  } catch (error) {
    console.error('Erro ao buscar itens em quarentena:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
