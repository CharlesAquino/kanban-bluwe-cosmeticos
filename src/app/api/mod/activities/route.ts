import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET /api/mod/activities
// Retorna lista de atividades MOD (placeholder - implementar com banco depois)
export async function GET(_request: NextRequest) {
  try {
    // TODO: Implementar query real ao banco de dados
    // Por enquanto retorna array vazio para não quebrar a UI
    
    return NextResponse.json({
      success: true,
      data: [],
    })
  } catch (error) {
    console.error('Erro ao buscar atividades MOD:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao buscar atividades MOD',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    )
  }
}

// POST /api/mod/activities
// Cria uma nova atividade MOD (placeholder - implementar com banco depois)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      operatorId,
      type,
      description,
      productId,
    } = body || {}

    if (!operatorId || !type || !description) {
      return NextResponse.json(
        {
          success: false,
          error: 'Campos obrigatórios não preenchidos',
          details: 'operatorId, type e description são obrigatórios',
        },
        { status: 400 }
      )
    }

    // TODO: Implementar insert real no banco de dados
    // Por enquanto apenas retorna sucesso
    
    const activity = {
      id: `activity_${Date.now()}`,
      operatorId,
      type,
      description,
      productId: productId || null,
      startedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    }

    return NextResponse.json(
      {
        success: true,
        data: activity,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erro ao criar atividade MOD:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao criar atividade MOD',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    )
  }
}
