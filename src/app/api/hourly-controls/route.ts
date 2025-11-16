import { NextRequest, NextResponse } from 'next/server'
import type { HourlyControl } from '@/lib/hourly-control'
import { prisma } from '@/lib/prisma'

// GET /api/hourly-controls - Listar controles hora a hora (dados reais a partir de produtos)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dateParam = searchParams.get('date')

    const todayStr = new Date().toISOString().split('T')[0]
    const targetDateStr = (dateParam || todayStr).slice(0, 10)

    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200,
    })

    const HOURLY_TARGET_KG = 50

    const controls: HourlyControl[] = products
      .filter((p) => {
        const createdAt = p.createdAt as Date
        const recordDate = createdAt.toISOString().slice(0, 10)
        return recordDate === targetDateStr
      })
      .map((p) => {
        const createdAt = p.createdAt as Date
        const updatedAt = p.updatedAt as Date
        const hour = createdAt.getHours()
        const shift: HourlyControl['shift'] =
          hour >= 6 && hour < 14
            ? 'morning'
            : hour >= 14 && hour < 22
            ? 'afternoon'
            : 'night'

        const actualQuantity = p.quantity
        const targetQuantity = HOURLY_TARGET_KG
        const efficiency =
          targetQuantity > 0 ? Math.round((actualQuantity / targetQuantity) * 100) : 0

        const status: HourlyControl['status'] =
          efficiency >= 100 ? 'ahead' : efficiency >= 90 ? 'on_track' : 'behind'

        const operator = p.createdById || 'Desconhecido'

        return {
          id: p.id,
          date: targetDateStr,
          shift,
          operator,
          productId: p.id,
          productName: p.name,
          targetQuantity,
          actualQuantity,
          efficiency,
          status,
          notes: p.notes ?? undefined,
          createdAt: createdAt.toISOString(),
          updatedAt: updatedAt.toISOString(),
        }
      })

    return NextResponse.json({
      success: true,
      data: {
        items: controls,
        total: controls.length,
        page: 1,
        limit: controls.length,
        totalPages: 1,
      },
    })
  } catch (error) {
    console.error('Erro ao buscar controles hora a hora:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor',
      },
      { status: 500 }
    )
  }
}

// POST /api/hourly-controls - Criar novo controle hora a hora
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, productName, targetQuantity, actualQuantity, operator, shift, notes } = body

    // Validação básica
    if (!productId || !productName || !targetQuantity || !actualQuantity || !operator || !shift) {
      return NextResponse.json({
        success: false,
        error: 'Campos obrigatórios: productId, productName, targetQuantity, actualQuantity, operator, shift'
      }, { status: 400 })
    }

    const target = parseInt(targetQuantity)
    const actual = parseInt(actualQuantity)

    if (isNaN(target) || isNaN(actual) || target <= 0 || actual < 0) {
      return NextResponse.json({
        success: false,
        error: 'Target e actual devem ser números válidos'
      }, { status: 400 })
    }

    const efficiency = Math.round((actual / target) * 100)

    const newControl: HourlyControl = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      shift: shift as 'morning' | 'afternoon' | 'night',
      operator,
      productId,
      productName,
      targetQuantity: target,
      actualQuantity: actual,
      efficiency,
      status: efficiency >= 100 ? 'ahead' : efficiency >= 90 ? 'on_track' : 'behind',
      notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      data: newControl
    }, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar controle hora a hora:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
}
