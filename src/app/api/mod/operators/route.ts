import { NextRequest, NextResponse } from 'next/server'
import { userQueries } from '@/lib/db/queries/users'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET /api/mod/operators
// Retorna a lista de operadores (users com role OPERATOR ou MOD_OPERATOR)
export async function GET(_request: NextRequest) {
  try {
    // Buscar por roles relevantes
    const operators = [
      ...(await userQueries.getByRole('OPERATOR')),
      ...(await userQueries.getByRole('MOD_OPERATOR')),
    ]

    // Remover duplicados por id
    const unique = Array.from(
      new Map(operators.map((u: any) => [u.id, u])).values()
    )

    return NextResponse.json({
      success: true,
      data: unique,
    })
  } catch (error) {
    console.error('Erro ao buscar operadores MOD:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao buscar operadores MOD',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    )
  }
}

// POST /api/mod/operators
// Cria um novo operador (user com role OPERATOR ou MOD_OPERATOR)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      name,
      email,
      role = 'OPERATOR', // padrão: operador normal
    } = body || {}

    if (!name || !email) {
      return NextResponse.json(
        {
          success: false,
          error: 'Campos obrigatórios não preenchidos',
          details: 'name e email são obrigatórios',
        },
        { status: 400 }
      )
    }

    // Senha placeholder enquanto autenticação não for reimplementada com Drizzle
    // (usuário operador normalmente não faz login direto no sistema)
    const placeholderPassword = `noop-${Math.random().toString(36).slice(2, 10)}`

    const user = await userQueries.create({
      email: String(email).trim().toLowerCase(),
      name: String(name).trim(),
      password: placeholderPassword,
      role: String(role).toUpperCase(),
    })

    return NextResponse.json(
      {
        success: true,
        data: user,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erro ao criar operador MOD:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao criar operador MOD',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    )
  }
}

export async function PATCH() {
  return NextResponse.json(
    { error: 'Rota PATCH /api/mod/operators ainda não implementada com Drizzle' },
    { status: 503 }
  )
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Rota DELETE /api/mod/operators ainda não implementada com Drizzle' },
    { status: 503 }
  )
}
