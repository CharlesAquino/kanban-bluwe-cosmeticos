/**
 * API Route: GET /api/tags - Listar tags
 * API Route: POST /api/tags - Criar tag
 */

import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/mock-prisma' // Temporário - usar real quando Prisma gerar

// GET /api/tags - Listar todas as tags
export async function GET() {
  try {
    const tags = await prisma.tag.findMany({
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            products: true,
            semiItems: true,
            tasks: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Calcular usageCount total
    const tagsWithCount = tags.map(tag => ({
      ...tag,
      usageCount: tag._count.products + tag._count.semiItems + tag._count.tasks
    }))

    return NextResponse.json(tagsWithCount)
  } catch (error) {
    console.error('Erro ao buscar tags:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST /api/tags - Criar nova tag
export async function POST(request: NextRequest) {
  try {
    return NextResponse.json(
      { error: 'Criação de tags está temporariamente desativada neste ambiente.' },
      { status: 503 }
    )
  } catch (error) {
    console.error('Erro ao criar tag:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
