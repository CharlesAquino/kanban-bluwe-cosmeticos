import { NextRequest, NextResponse } from 'next/server'

// POST /api/cep/data - Adicionar dados de processo (simulado)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { controlChartId, measurements, subgroup, operator, notes, productId, productName, stage } = body

    if (!controlChartId || !measurements || !Array.isArray(measurements) || measurements.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Campos obrigatórios: controlChartId, measurements (array não vazio)'
      }, { status: 400 })
    }

    // Dados simulados para demonstração
    const mockProcessData = measurements.map((measurement, index) => ({
      id: Date.now().toString() + index,
      measurement,
      subgroup: subgroup || 1,
      timestamp: new Date().toISOString(),
      operator: operator || 'Sistema',
      notes: notes || 'Dados adicionados via API',
      controlChartId
    }))

    return NextResponse.json({
      success: true,
      data: mockProcessData
    })
  } catch (error) {
    console.error('Erro ao adicionar dados de processo:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
}
