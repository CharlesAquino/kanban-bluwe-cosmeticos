import { NextRequest, NextResponse } from 'next/server'

// Mock operators temporário
const mockOperators = [
  {
    id: 'mock-op-1',
    name: 'João Silva',
    email: 'joao@bluwe.com',
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'mock-op-2',
    name: 'Maria Santos',
    email: 'maria@bluwe.com',
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'mock-op-3',
    name: 'Pedro Costa',
    email: 'pedro@bluwe.com',
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date()
  }
]

export async function GET() {
  try {
    console.log('=== API MOD/OPERATORS: Retornando operadores mock ===')

    return NextResponse.json({
      success: true,
      data: mockOperators
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
