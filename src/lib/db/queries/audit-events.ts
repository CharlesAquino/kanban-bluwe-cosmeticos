/**
 * Queries Drizzle para Audit Events
 */

import { db } from '../client'
import { sql } from 'drizzle-orm'

export const auditEventQueries = {
  /**
   * Registrar evento de auditoria
   */
  async recordEvent(data: {
    action: string
    entityType: string
    entityId: string
    userId?: string
    userName?: string
    oldValues?: Record<string, any>
    newValues?: Record<string, any>
    ipAddress?: string
    userAgent?: string
  }) {
    try {
      await db.execute(
        sql`
          INSERT INTO audit_events (
            id, action, entity_type, entity_id, user_id, user_name,
            old_values, new_values, ip_address, user_agent, created_at
          ) VALUES (
            ${`ae_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`},
            ${data.action},
            ${data.entityType},
            ${data.entityId},
            ${data.userId || null},
            ${data.userName || null},
            ${data.oldValues ? JSON.stringify(data.oldValues) : null},
            ${data.newValues ? JSON.stringify(data.newValues) : null},
            ${data.ipAddress || null},
            ${data.userAgent || null},
            NOW()
          )
        `
      )
      return true
    } catch {
      return false
    }
  },

  /**
   * Buscar eventos por entidade
   */
  async getByEntity(entityType: string, entityId: string, limit: number = 100) {
    try {
      const result = await db.execute(
        sql`
          SELECT * FROM audit_events
          WHERE entity_type = ${entityType} AND entity_id = ${entityId}
          ORDER BY created_at DESC
          LIMIT ${limit}
        `
      )
      return result.rows || []
    } catch {
      return []
    }
  },

  /**
   * Buscar eventos por usuário
   */
  async getByUser(userId: string, limit: number = 100) {
    try {
      const result = await db.execute(
        sql`
          SELECT * FROM audit_events
          WHERE user_id = ${userId}
          ORDER BY created_at DESC
          LIMIT ${limit}
        `
      )
      return result.rows || []
    } catch {
      return []
    }
  },

  /**
   * Buscar eventos por ação
   */
  async getByAction(action: string, limit: number = 100) {
    try {
      const result = await db.execute(
        sql`
          SELECT * FROM audit_events
          WHERE action = ${action}
          ORDER BY created_at DESC
          LIMIT ${limit}
        `
      )
      return result.rows || []
    } catch {
      return []
    }
  },

  /**
   * Buscar eventos por data
   */
  async getByDateRange(startDate: string, endDate: string, limit: number = 100) {
    try {
      const result = await db.execute(
        sql`
          SELECT * FROM audit_events
          WHERE created_at >= ${startDate} AND created_at <= ${endDate}
          ORDER BY created_at DESC
          LIMIT ${limit}
        `
      )
      return result.rows || []
    } catch {
      return []
    }
  },

  /**
   * Obter todos os eventos recentes
   */
  async getRecent(limit: number = 100) {
    try {
      const result = await db.execute(
        sql`
          SELECT * FROM audit_events
          ORDER BY created_at DESC
          LIMIT ${limit}
        `
      )
      return result.rows || []
    } catch {
      return []
    }
  },

  /**
   * Limpar eventos antigos
   */
  async cleanOldEvents(daysOld: number = 90) {
    try {
      await db.execute(
        sql`
          DELETE FROM audit_events
          WHERE created_at < NOW() - INTERVAL '${daysOld} days'
        `
      )
      return true
    } catch {
      return false
    }
  },
}
