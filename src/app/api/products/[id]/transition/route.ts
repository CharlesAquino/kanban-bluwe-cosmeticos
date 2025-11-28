import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Rota de transição avançada (state machine) ainda não migrada para Drizzle.
// Neutralizada temporariamente para evitar dependência de Prisma.

export async function POST(_request: NextRequest) {
  return NextResponse.json(
    {
      success: false,
      error: 'Rota /api/products/[id]/transition ainda não foi migrada para Drizzle',
    },
    { status: 503 }
  )
}

export async function GET(_request: NextRequest) {
  return NextResponse.json(
    {
      success: false,
      error: 'Rota /api/products/[id]/transition ainda não foi migrada para Drizzle',
    },
    { status: 503 }
  )
}
