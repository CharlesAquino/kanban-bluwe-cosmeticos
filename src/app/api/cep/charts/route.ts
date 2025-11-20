import { NextRequest, NextResponse } from 'next/server'

// GET /api/cep/charts - Buscar cartas de controle (simulado)
export async function GET(request: NextRequest) {
  try {
    // Por enquanto, retornar dados simulados até resolver geração Prisma
    const mockCharts = [
      {
        id: '1',
        name: 'Eficiência - Produção 1kg',
        chartType: 'x_bar_r',
        characteristic: 'eficiência_produção',
        sampleSize: 5,
        frequency: 1,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]

    return NextResponse.json({
      success: true,
      data: mockCharts
    })
  } catch (error) {
    console.error('Erro ao buscar cartas de controle:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
}

// POST /api/cep/charts - Criar nova carta de controle (simulado)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, chartType, characteristic, sampleSize, frequency } = body

    if (!name || !chartType || !characteristic) {
      return NextResponse.json({
        success: false,
        error: 'Campos obrigatórios: name, chartType, characteristic'
      }, { status: 400 })
    }

    // Dados simulados para demonstração
    const newChart = {
      id: Date.now().toString(),
      name,
      chartType,
      characteristic,
      sampleSize: sampleSize || 5,
      frequency: frequency || 1,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      data: newChart
    }, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar carta de controle:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
}
