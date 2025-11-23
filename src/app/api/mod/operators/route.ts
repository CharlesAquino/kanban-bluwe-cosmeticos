import { NextRequest, NextResponse } from 'next/server'
import { getOperators } from '@/lib/api-fallback'

export async function GET() {
  try {
    console.log('=== API MOD/OPERATORS: Buscando operadores ===')

    const operators = await getOperators()

    console.log('=== API MOD/OPERATORS: Operadores encontrados:', operators.length)

    return NextResponse.json({
      success: true,
      data: operators
    })
  } catch (error) {
    console.error('Erro ao listar MOD operators:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== API MOD/OPERATORS: Criando operador ===')

    const body = await request.json()
    const { name, role, isActive = true } = body

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Nome do operador é obrigatório' },
        { status: 400 }
      )
    }

    // Simulação de criação (mock)
    const newOperator = {
      id: `mock-op-${Date.now()}`,
      name: name.trim(),
      role: role || 'OPERATOR',
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    console.log('=== API MOD/OPERATORS: Operador criado ===', newOperator.id)

    return NextResponse.json(
      { success: true, data: newOperator },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erro ao salvar MOD operator:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
