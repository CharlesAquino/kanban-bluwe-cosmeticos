import { NextResponse } from 'next/server'

// Rota de debug de semi-acabados temporariamente desativada neste ambiente de build,
// até que o pipeline execute `prisma generate` corretamente antes do Next.js.
export async function GET() {
  return NextResponse.json(
    {
      success: false,
      error:
        'Rota /api/debug/semi-finished temporariamente desativada. Ajustar pipeline de Prisma antes de ativar em produção.',
    },
    { status: 503 },
  )
}
