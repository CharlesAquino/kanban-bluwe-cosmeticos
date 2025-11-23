/**
 * API Route: PATCH /api/tags/[id] - Atualizar tag
 * API Route: DELETE /api/tags/[id] - Excluir tag
 */

import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/mock-prisma' // Temporário - usar real quando Prisma gerar
import { getServerSession, mockSession } from '@/lib/auth' // Temporário - usar real quando Prisma gerar

interface RouteParams {
  params: { id: string }
}

// PATCH /api/tags/[id] - Atualizar tag
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    // Temporário - usar mock session até Prisma gerar
    const session = mockSession
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const { id } = params
    const body = await request.json()
    const { name, color, description } = body

    // Verificar se tag existe
    const existingTag = await prisma.tag.findUnique({
      where: { id }
    })

    if (!existingTag) {
      return NextResponse.json(
        { error: 'Tag não encontrada' },
        { status: 404 }
      )
    }

    // Verificar se novo nome já existe (se estiver mudando o nome)
    if (name && name.trim() !== existingTag.name) {
      const nameConflict = await prisma.tag.findFirst({
        where: { 
          name: name.trim(),
          id: { not: id }
        }
      })

      if (nameConflict) {
        return NextResponse.json(
          { error: 'Tag com este nome já existe' },
          { status: 409 }
        )
      }
    }

    const updateData: any = {}
    if (name !== undefined) updateData.name = name.trim()
    if (color !== undefined) updateData.color = color
    if (description !== undefined) updateData.description = description?.trim() || null

    const tag = await prisma.tag.update({
      where: { id },
      data: updateData,
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
      }
    })

    return NextResponse.json({
      ...tag,
      usageCount: tag._count.products + tag._count.semiItems + tag._count.tasks
    })
  } catch (error) {
    console.error('Erro ao atualizar tag:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/tags/[id] - Excluir tag
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Temporário - usar mock session até Prisma gerar
    const session = mockSession
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const { id } = params

    // Verificar se tag existe
    const existingTag = await prisma.tag.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            products: true,
            semiItems: true,
            tasks: true
          }
        }
      }
    })

    if (!existingTag) {
      return NextResponse.json(
        { error: 'Tag não encontrada' },
        { status: 404 }
      )
    }

    // Verificar se tag está em uso
    const totalUsage = existingTag._count.products + existingTag._count.semiItems + existingTag._count.tasks
    if (totalUsage > 0) {
      return NextResponse.json(
        { error: 'Não é possível excluir tag que está em uso' },
        { status: 409 }
      )
    }

    await prisma.tag.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao excluir tag:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
