import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { users } from '@/lib/db/schema'
import { sql } from 'drizzle-orm'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// POST /api/mod/operators/test
// Versão simplificada para debug
export async function POST(request: NextRequest) {
  try {
    console.log('[TEST] Iniciando teste de criação de operador')
    
    const body = await request.json()
    console.log('[TEST] Body:', JSON.stringify(body, null, 2))

    const { name, email } = body

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Nome e email são obrigatórios' },
        { status: 400 }
      )
    }

    // Testar insert direto com SQL raw
    console.log('[TEST] Tentando insert com SQL raw...')
    
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const password = `noop-${Math.random().toString(36).slice(2, 10)}`
    
    const result = await db.execute(sql`
      INSERT INTO users (id, email, name, password, role, "createdAt", "updatedAt")
      VALUES (
        ${userId},
        ${email.trim().toLowerCase()},
        ${name.trim()},
        ${password},
        'MOD_OPERATOR',
        NOW(),
        NOW()
      )
      RETURNING *
    `)

    console.log('[TEST] Insert bem-sucedido!')
    console.log('[TEST] Result:', JSON.stringify(result, null, 2))

    return NextResponse.json(
      {
        success: true,
        message: 'Operador criado com sucesso (teste)',
        data: result.rows[0],
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[TEST] Erro:', error)
    console.error('[TEST] Error name:', error instanceof Error ? error.name : 'N/A')
    console.error('[TEST] Error message:', error instanceof Error ? error.message : 'N/A')
    console.error('[TEST] Error stack:', error instanceof Error ? error.stack : 'N/A')
    
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao criar operador (teste)',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
        name: error instanceof Error ? error.name : undefined,
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}
