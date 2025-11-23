/**
 * API Route: GET /api/tags - Listar tags
 * API Route: POST /api/tags - Criar tag
 */

import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

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
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, color, description } = body

    if (!name || !color) {
      return NextResponse.json(
        { error: 'Nome e cor são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se tag já existe
    const existingTag = await prisma.tag.findFirst({
      where: { name: name.trim() }
    })

    if (existingTag) {
      return NextResponse.json(
        { error: 'Tag com este nome já existe' },
        { status: 409 }
      )
    }

    const tag = await prisma.tag.create({
      data: {
        name: name.trim(),
        color,
        description: description?.trim() || null,
        createdById: session.user.id
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      ...tag,
      usageCount: 0
    })
  } catch (error) {
    console.error('Erro ao criar tag:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
