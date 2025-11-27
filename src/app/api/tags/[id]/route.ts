/**
 * API Route: PATCH /api/tags/[id] - Atualizar tag
 * API Route: DELETE /api/tags/[id] - Excluir tag
 * 
 * NOTA: Temporariamente desativada. Será implementada com Drizzle + real database.
 */

import { NextResponse } from 'next/server'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// PATCH /api/tags/[id] - Atualizar tag
export async function PATCH() {
  return NextResponse.json(
    { error: 'Atualização de tags está temporariamente desativada neste ambiente.' },
    { status: 503 }
  )
}

// DELETE /api/tags/[id] - Excluir tag
export async function DELETE() {
  return NextResponse.json(
    { error: 'Exclusão de tags está temporariamente desativada neste ambiente.' },
    { status: 503 }
  )
}
