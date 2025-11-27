/**
 * API Route: GET /api/tasks - Listar tarefas
 * API Route: POST /api/tasks - Criar tarefa
 * 
 * NOTA: Temporariamente desativada. Será implementada com Drizzle + real database.
 */

import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET /api/tasks - Listar tarefas
export async function GET() {
  return NextResponse.json(
    { error: 'Operação de tarefas temporariamente desativada. Será reimplementada com banco de dados real.' },
    { status: 503 }
  )
}

// POST /api/tasks - Criar tarefa
export async function POST() {
  return NextResponse.json(
    { error: 'Criação de tarefas está temporariamente desativada neste ambiente.' },
    { status: 503 }
  )
}
