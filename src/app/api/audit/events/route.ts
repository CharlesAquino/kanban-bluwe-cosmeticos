/**
 * API Route: GET/POST /api/audit/events
 * Auditoria de eventos do sistema
 */

import { NextRequest, NextResponse } from 'next/server'
import { auditEventQueries } from '@/lib/db/queries/audit-events'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const entityType = searchParams.get('entityType')
    const entityId = searchParams.get('entityId')
    const userId = searchParams.get('userId')
    const action = searchParams.get('action')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const limit = Math.min(Number(searchParams.get('limit')) || 100, 1000)

    let events

    if (entityType && entityId) {
      events = await auditEventQueries.getByEntity(entityType, entityId, limit)
    } else if (userId) {
      events = await auditEventQueries.getByUser(userId, limit)
    } else if (action) {
      events = await auditEventQueries.getByAction(action, limit)
    } else if (startDate && endDate) {
      events = await auditEventQueries.getByDateRange(startDate, endDate, limit)
    } else {
      events = await auditEventQueries.getRecent(limit)
    }

    return NextResponse.json({
      success: true,
      data: events,
      count: events.length,
    })
  } catch (error) {
    console.error('Erro ao buscar eventos de auditoria:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao buscar eventos de auditoria',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      action,
      entityType,
      entityId,
      userId,
      userName,
      oldValues,
      newValues,
      ipAddress,
      userAgent,
    } = body

    if (!action || !entityType || !entityId) {
      return NextResponse.json(
        {
          success: false,
          error: 'action, entityType e entityId são obrigatórios',
        },
        { status: 400 }
      )
    }

    const success = await auditEventQueries.recordEvent({
      action,
      entityType,
      entityId,
      userId,
      userName,
      oldValues,
      newValues,
      ipAddress,
      userAgent,
    })

    if (!success) {
      throw new Error('Falha ao registrar evento')
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Evento registrado com sucesso',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erro ao registrar evento de auditoria:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao registrar evento',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    )
  }
}
