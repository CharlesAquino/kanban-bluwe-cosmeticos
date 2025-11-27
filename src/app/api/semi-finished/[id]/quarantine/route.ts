import { NextResponse } from 'next/server'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Rota de quarentena temporariamente desativada neste ambiente de build,
// até que o pipeline execute `prisma generate` corretamente antes do Next.js.
export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error:
        'Rota /api/semi-finished/[id]/quarantine temporariamente desativada. Ajustar pipeline de Prisma antes de ativar em produção.',
    },
    { status: 503 },
  )
}
