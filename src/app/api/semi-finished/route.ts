import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'

// GET /api/semi-finished - Lista itens de semi-acabados em Postgres
export async function GET() {
  try {
    const items = await prisma.semiFinishedItem.findMany({
      where: {
        status: {
          not: 'QUARENTENA' // Excluir produtos em quarentena
        }
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
    const message = error instanceof Error ? error.message : 'Erro desconhecido'
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor', details: message },
      { status: 500 },
    )
  }
}

// POST /api/semi-finished - Cria item de semi-acabados (casos legados)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, name, family, op, batch, quantity_total, manufacturingDate } = body || {}

    if (!name || !family || !op || !batch || !quantity_total) {
      return NextResponse.json(
        { success: false, error: 'Campos obrigatórios: name, family, op, batch, quantity_total' },
        { status: 400 },
      )
    }

    const normalizedOp = String(op).trim()
    const normalizedBatch = String(batch).trim()
    const qtyTotal = Number(quantity_total)

    if (!Number.isFinite(qtyTotal) || qtyTotal <= 0) {
      return NextResponse.json(
        { success: false, error: 'quantity_total deve ser um número positivo' },
        { status: 400 },
      )
    }

    // Regra de negócio: não permitir OP + Lote duplicados em Semi-Acabados
    const existing = await prisma.semiFinishedItem.findFirst({
      where: {
        op: normalizedOp,
        batch: normalizedBatch,
      },
    })

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Já existe um produto de Semi-Acabados com esta OP e lote.' },
        { status: 400 },
      )
    }

    const created = await prisma.semiFinishedItem.create({
      data: {
        productId: productId ? String(productId) : null,
        name: String(name).trim(),
        family: String(family).trim() || 'Sem Família',
        op: normalizedOp,
        batch: normalizedBatch,
        quantityTotal: qtyTotal,
        quantityEnvasado: 0,
        status: 'aguardando',
        manufacturingDate: manufacturingDate ? new Date(manufacturingDate) : new Date(),
      },
    })

    return NextResponse.json({ success: true, data: created }, { status: 201 })
  } catch (error: any) {
    // Tratar possível violação de unique constraint (op+batch)
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'Já existe um produto de Semi-Acabados com esta OP e lote.' },
        { status: 400 },
      )
    }

    const message = error instanceof Error ? error.message : 'Erro desconhecido'
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor', details: message },
      { status: 500 },
    )
  }
}
