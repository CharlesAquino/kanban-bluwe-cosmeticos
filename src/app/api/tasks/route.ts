/**
 * API Route: GET /api/tasks - Listar tarefas
 * API Route: POST /api/tasks - Criar tarefa
 */

import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/mock-prisma' // Temporário - usar real quando Prisma gerar
import { TaskPriority } from '@/types/clickup-types'

// GET /api/tasks - Listar tarefas com filtros
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const status = searchParams.get('status')?.split(',').filter(Boolean)
    const priority = searchParams.get('priority')?.split(',').filter(Boolean) as TaskPriority[]
    const assigneeId = searchParams.get('assigneeId')?.split(',').filter(Boolean)
    const tagId = searchParams.get('tagId')?.split(',').filter(Boolean)
    const search = searchParams.get('search')
    const dueDateStart = searchParams.get('dueDateStart')
    const dueDateEnd = searchParams.get('dueDateEnd')

    const where: any = {}

    if (status && status.length > 0) {
      where.status = { in: status }
    }

    if (priority && priority.length > 0) {
      where.priority = { in: priority }
    }

    if (assigneeId && assigneeId.length > 0) {
      where.assignees = {
        some: {
          userId: { in: assigneeId }
        }
      }
    }

    if (tagId && tagId.length > 0) {
      where.tags = {
        some: {
          tagId: { in: tagId }
        }
      }
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (dueDateStart || dueDateEnd) {
      where.dueDate = {}
      if (dueDateStart) {
        where.dueDate.gte = new Date(dueDateStart)
      }
      if (dueDateEnd) {
        where.dueDate.lte = new Date(dueDateEnd)
      }
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        assignees: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true
              }
            }
          }
        },
        tags: {
          include: {
            tag: true
          }
        },
        dependencies: {
          include: {
            dependsOn: {
              select: {
                id: true,
                title: true
              }
            }
          }
        },
        dependents: {
          include: {
            dependent: {
              select: {
                id: true,
                title: true
              }
            }
          }
        },
        subtasks: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true
          }
        },
        parentTask: {
          select: {
            id: true,
            title: true
          }
        },
        _count: {
          select: {
            subtasks: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(tasks)
  } catch (error) {
    console.error('Erro ao buscar tarefas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST /api/tasks - Criar nova tarefa
export async function POST(request: NextRequest) {
  try {
    return NextResponse.json(
      { error: 'Criação de tarefas está temporariamente desativada neste ambiente.' },
      { status: 503 }
    )
  } catch (error) {
    console.error('Erro ao criar tarefa:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
