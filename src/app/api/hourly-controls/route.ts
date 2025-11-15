import { NextRequest, NextResponse } from 'next/server'
import type { HourlyControl } from '@/lib/hourly-control'

// GET /api/hourly-controls - Listar controles hora a hora
export async function GET() {
  try {
    // Por enquanto, retornando dados mockados
    // Em produção, isso seria conectado ao banco de dados
    const mockControls: HourlyControl[] = [
      {
        id: '1',
        date: new Date().toISOString().split('T')[0],
        shift: 'morning',
        operator: 'João Silva',
        productId: 'prod-1',
        productName: 'Produto A',
        targetQuantity: 100,
        actualQuantity: 95,
        efficiency: 95,
        status: 'behind',
        notes: 'Problema na máquina durante 30 minutos',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        date: new Date().toISOString().split('T')[0],
        shift: 'morning',
        operator: 'Maria Santos',
        productId: 'prod-2',
        productName: 'Produto B',
        targetQuantity: 80,
        actualQuantity: 85,
        efficiency: 106,
        status: 'ahead',
        notes: 'Produção acima da meta',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]

    return NextResponse.json({
      success: true,
      data: {
        items: mockControls,
        total: mockControls.length,
        page: 1,
        limit: mockControls.length,
        totalPages: 1
      }
    })
  } catch (error) {
    console.error('Erro ao buscar controles hora a hora:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 })
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
