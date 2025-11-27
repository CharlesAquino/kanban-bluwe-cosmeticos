import { NextResponse } from 'next/server'

// Rota de pausa temporariamente desativada neste ambiente de build,
// até que o pipeline execute `prisma generate` corretamente antes do Next.js.
export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error:
        'Rota /api/products/[id]/pause temporariamente desativada. Ajustar pipeline de Prisma antes de ativar em produção.',
    },
    { status: 503 },
  )
}
