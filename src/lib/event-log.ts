/**
 * Event Log System
 * 
 * Registra todos os eventos de transição de estado
 * Fornece auditoria completa do histórico de produtos
 */

import { ProductStage } from '@prisma/client'

export type EventType = 
  | 'PRODUCT_CREATED'
  | 'STAGE_TRANSITIONED'
  | 'STAGE_REJECTED'
  | 'PRODUCT_FINALIZED'
  | 'PRODUCT_ARCHIVED'
  | 'QUALITY_CHECK_PASSED'
  | 'QUALITY_CHECK_FAILED'

export interface EventLogEntry {
  id?: string
  productId: string
  eventType: EventType
  previousStage?: ProductStage
  newStage?: ProductStage
  userId: string
  reason?: string
  metadata?: Record<string, unknown>
  timestamp: Date
  ipAddress?: string
  userAgent?: string
}

export interface EventLogFilter {
  productId?: string
  eventType?: EventType
  userId?: string
  startDate?: Date
  endDate?: Date
  limit?: number
  offset?: number
}

/**
 * Armazenar eventos em memória (em produção, usar banco de dados)
 */
class EventLogStore {
  private events: EventLogEntry[] = []
  private readonly MAX_EVENTS = 10000

  /**
   * Registrar evento
   */
  log(entry: EventLogEntry): EventLogEntry {
    const event: EventLogEntry = {
      ...entry,
      id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: entry.timestamp || new Date()
    }

    this.events.push(event)

    // Manter limite de memória
    if (this.events.length > this.MAX_EVENTS) {
      this.events.shift()
    }

    // Log estruturado
    console.log(`[EVENT] ${event.eventType}`, {
      productId: event.productId,
      from: event.previousStage,
      to: event.newStage,
      userId: event.userId,
      timestamp: event.timestamp.toISOString()
    })

    return event
  }

  /**
   * Obter histórico de um produto
   */
  getProductHistory(productId: string): EventLogEntry[] {
    return this.events
      .filter(e => e.productId === productId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  /**
   * Buscar eventos com filtros
   */
  search(filter: EventLogFilter): EventLogEntry[] {
    let results = [...this.events]

    if (filter.productId) {
      results = results.filter(e => e.productId === filter.productId)
    }

    if (filter.eventType) {
      results = results.filter(e => e.eventType === filter.eventType)
    }

    if (filter.userId) {
      results = results.filter(e => e.userId === filter.userId)
    }

    if (filter.startDate) {
      results = results.filter(e => e.timestamp >= filter.startDate!)
    }

    if (filter.endDate) {
      results = results.filter(e => e.timestamp <= filter.endDate!)
    }

    // Ordenar por timestamp descendente
    results.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

    // Aplicar paginação
    const offset = filter.offset || 0
    const limit = filter.limit || 100

    return results.slice(offset, offset + limit)
  }

  /**
   * Obter estatísticas
   */
  getStats(): {
    totalEvents: number
    eventsByType: Record<EventType, number>
    uniqueProducts: number
    uniqueUsers: number
  } {
    const eventsByType: Record<EventType, number> = {
      PRODUCT_CREATED: 0,
      STAGE_TRANSITIONED: 0,
      STAGE_REJECTED: 0,
      PRODUCT_FINALIZED: 0,
      PRODUCT_ARCHIVED: 0,
      QUALITY_CHECK_PASSED: 0,
      QUALITY_CHECK_FAILED: 0
    }

    const products = new Set<string>()
    const users = new Set<string>()

    for (const event of this.events) {
      eventsByType[event.eventType]++
      products.add(event.productId)
      users.add(event.userId)
    }

    return {
      totalEvents: this.events.length,
      eventsByType,
      uniqueProducts: products.size,
      uniqueUsers: users.size
    }
  }

  /**
   * Limpar eventos (útil para testes)
   */
  clear(): void {
    this.events = []
  }

  /**
   * Exportar eventos para auditoria
   */
  export(format: 'json' | 'csv' = 'json'): string {
    if (format === 'json') {
      return JSON.stringify(this.events, null, 2)
    }

    // CSV
    const headers = ['ID', 'ProductID', 'EventType', 'From', 'To', 'UserID', 'Timestamp', 'Reason']
    const rows = this.events.map(e => [
      e.id,
      e.productId,
      e.eventType,
      e.previousStage || '',
      e.newStage || '',
      e.userId,
      e.timestamp.toISOString(),
      e.reason || ''
    ])

    return [
      headers.join(','),
      ...rows.map(r => r.map(v => `"${v}"`).join(','))
    ].join('\n')
  }
}

// Export singleton
export const eventLog = new EventLogStore()

/**
 * Helpers para registrar eventos comuns
 */

export function logProductCreated(
  productId: string,
  userId: string,
  metadata?: Record<string, unknown>
): EventLogEntry {
  return eventLog.log({
    productId,
    eventType: 'PRODUCT_CREATED',
    userId,
    metadata,
    timestamp: new Date()
  })
}

export function logStageTransition(
  productId: string,
  from: ProductStage,
  to: ProductStage,
  userId: string,
  reason?: string
): EventLogEntry {
  return eventLog.log({
    productId,
    eventType: 'STAGE_TRANSITIONED',
    previousStage: from,
    newStage: to,
    userId,
    reason,
    timestamp: new Date()
  })
}

export function logStageRejected(
  productId: string,
  stage: ProductStage,
  userId: string,
  reason: string
): EventLogEntry {
  return eventLog.log({
    productId,
    eventType: 'STAGE_REJECTED',
    previousStage: stage,
    newStage: 'REJEITADO',
    userId,
    reason,
    timestamp: new Date()
  })
}

export function logProductFinalized(
  productId: string,
  userId: string,
  reason?: string
): EventLogEntry {
  return eventLog.log({
    productId,
    eventType: 'PRODUCT_FINALIZED',
    previousStage: 'APROVADO',
    userId,
    reason,
    timestamp: new Date()
  })
}
