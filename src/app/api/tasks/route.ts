/**
 * API Route: GET /api/tasks - Listar tarefas
 * API Route: POST /api/tasks - Criar tarefa
 */

import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
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
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { 
      title, 
      description, 
      priority = TaskPriority.NORMAL, 
      status = 'todo', 
      dueDate, 
      assigneeIds = [], 
      tagIds = [], 
      parentTaskId 
    } = body

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: 'Título é obrigatório' },
        { status: 400 }
      )
    }

    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        priority,
        status,
        dueDate: dueDate ? new Date(dueDate) : null,
        createdById: session.user.id,
        parentTaskId: parentTaskId || null,
        assignees: assigneeIds.length > 0 ? {
          create: assigneeIds.map((userId: string) => ({
            userId,
            role: 'assignee'
          }))
        } : undefined,
        tags: tagIds.length > 0 ? {
          create: tagIds.map((tagId: string) => ({
            tagId
          }))
        } : undefined
      },
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
        }
      }
    })

    // Criar activity log
    await prisma.activityLog.create({
      data: {
        action: 'created',
        entityType: 'task',
        entityId: task.id,
        userId: session.user.id,
        metadata: {
          taskTitle: task.title,
          taskPriority: task.priority,
          taskStatus: task.status
        }
      }
    })

    return NextResponse.json(task)
  } catch (error) {
    console.error('Erro ao criar tarefa:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
