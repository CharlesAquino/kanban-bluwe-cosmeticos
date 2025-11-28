import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Rota de DELETE de semi-acabados ainda não migrada para Drizzle.
// Neutralizada temporariamente para remover dependência de Prisma.

export async function DELETE(_req: NextRequest, _ctx: { params: { id: string } }) {
  return NextResponse.json(
    {
      success: false,
      error:
        'Rota DELETE /api/semi-finished/[id] ainda não foi migrada para Drizzle e está temporariamente desativada',
    },
    { status: 503 }
  )
}
