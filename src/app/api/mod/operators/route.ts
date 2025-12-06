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
    console.log('[MOD] Recebendo requisição POST /api/mod/operators')
    
    const body = await request.json()
    console.log('[MOD] Body recebido:', { name: body?.name, email: body?.email, role: body?.role })

    const {
      name,
      email,
      role = 'MOD_OPERATOR', // padrão: MOD_OPERATOR
    } = body || {}

    if (!name || !email) {
      console.error('[MOD] Campos obrigatórios faltando:', { name, email })
      return NextResponse.json(
        {
          success: false,
          error: 'Campos obrigatórios não preenchidos',
          details: 'name e email são obrigatórios',
        },
        { status: 400 }
      )
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.error('[MOD] Email inválido:', email)
      return NextResponse.json(
        {
          success: false,
          error: 'Email inválido',
          details: 'Por favor, forneça um email válido',
        },
        { status: 400 }
      )
    }

    // Verificar se email já existe
    try {
      const existing = await userQueries.getByEmail(email.trim().toLowerCase())
      if (existing) {
        console.error('[MOD] Email já cadastrado:', email)
        return NextResponse.json(
          {
            success: false,
            error: 'Email já cadastrado',
            details: 'Este email já está em uso por outro operador',
          },
          { status: 409 }
        )
      }
    } catch (err) {
      console.log('[MOD] Email não existe (ok):', email)
    }

    // Senha placeholder enquanto autenticação não for reimplementada com Drizzle
    // (usuário operador normalmente não faz login direto no sistema)
    const placeholderPassword = `noop-${Math.random().toString(36).slice(2, 10)}`
    
    console.log('[MOD] Criando operador com role:', role)

    const user = await userQueries.create({
      email: String(email).trim().toLowerCase(),
      name: String(name).trim(),
      password: placeholderPassword,
      role: String(role).toUpperCase(),
    })

    console.log('[MOD] Operador criado com sucesso:', user.id)

    return NextResponse.json(
      {
        success: true,
        data: user,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[MOD] Erro ao criar operador MOD:', error)
    console.error('[MOD] Stack trace:', error instanceof Error ? error.stack : 'N/A')
    
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao criar operador MOD',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
        stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined,
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
