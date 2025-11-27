/**
 * API Route: GET /api/tags - Listar tags
 * API Route: POST /api/tags - Criar tag
 * 
 * NOTA: Temporariamente desativada. Será implementada com Drizzle + real database.
 */

import { NextResponse } from 'next/server'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET /api/tags - Listar todas as tags
export async function GET() {
  return NextResponse.json(
    { error: 'Operação de tags temporariamente desativada. Será reimplementada com banco de dados real.' },
    { status: 503 }
  )
}

// POST /api/tags - Criar nova tag
export async function POST() {
  return NextResponse.json(
    { error: 'Criação de tags está temporariamente desativada neste ambiente.' },
    { status: 503 }
  )
}
