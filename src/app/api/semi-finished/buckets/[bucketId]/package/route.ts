import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(_request: NextRequest, _ctx: { params: { bucketId: string } }) {
  return NextResponse.json(
    {
      success: false,
      error:
        'Rota /api/semi-finished/buckets/[bucketId]/package ainda não foi migrada para Drizzle e está temporariamente desativada',
    },
    { status: 503 }
  )
}
