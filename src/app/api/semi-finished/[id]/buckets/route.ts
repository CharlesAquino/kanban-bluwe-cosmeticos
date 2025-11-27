import { NextResponse } from 'next/server'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Rota de buckets temporariamente desativada neste ambiente de build,
// até que o pipeline execute `prisma generate` corretamente antes do Next.js.
export async function GET() {
  return NextResponse.json(
    {
      success: false,
      error:
        'Rota /api/semi-finished/[id]/buckets temporariamente desativada. Ajustar pipeline de Prisma antes de ativar em produção.',
    },
    { status: 503 },
  )
}
