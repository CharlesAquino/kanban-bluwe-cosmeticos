import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Rotas de containers de semi-acabados ainda não migradas para Drizzle.
// Neutralizadas temporariamente para remover dependência de Prisma.

export async function GET(_req: NextRequest, _ctx: { params: { id: string } }) {
  return NextResponse.json(
    {
      success: false,
      error:
        'Rota GET /api/semi-finished/[id]/containers ainda não foi migrada para Drizzle e está temporariamente desativada',
    },
    { status: 503 }
  )
}

export async function POST(_req: NextRequest, _ctx: { params: { id: string } }) {
  return NextResponse.json(
    {
      success: false,
      error:
        'Rota POST /api/semi-finished/[id]/containers ainda não foi migrada para Drizzle e está temporariamente desativada',
    },
    { status: 503 }
  )
}
