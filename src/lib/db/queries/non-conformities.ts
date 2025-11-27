/**
 * Queries Drizzle para Non-Conformities (NCs)
 */

import { db } from '../client'
import { sql } from 'drizzle-orm'

export const nonConformityQueries = {
  /**
   * Criar nova não-conformidade
   */
  async create(data: {
    productId: string
    productName: string
    batch: string
    stage: string
    type: string
    severity: string
    description: string
    responsible?: string
    deadline?: string
  }) {
    const result = await db.execute(
      sql`
        INSERT INTO non_conformities (
          id, product_id, product_name, batch, stage, type,
          severity, description, status, responsible, deadline, created_at
        ) VALUES (
          ${`nc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`},
          ${data.productId},
          ${data.productName},
          ${data.batch},
          ${data.stage},
          ${data.type},
          ${data.severity},
          ${data.description},
          'open',
          ${data.responsible || null},
          ${data.deadline || null},
          NOW()
        )
      `
    )

    return {
      id: `nc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...data,
      status: 'open',
      createdAt: new Date(),
    }
  },

  /**
   * Buscar todas as NCs
   */
  async getAll() {
    try {
      const result = await db.execute(
        sql`SELECT * FROM non_conformities ORDER BY created_at DESC`
      )
      return result.rows || []
    } catch {
      return []
    }
  },

  /**
   * Buscar NCs abertas
   */
  async getOpen() {
    try {
      const result = await db.execute(
        sql`SELECT * FROM non_conformities WHERE status = 'open' ORDER BY created_at DESC`
      )
      return result.rows || []
    } catch {
      return []
    }
  },

  /**
   * Buscar NCs por produto
   */
  async getByProduct(productId: string) {
    try {
      const result = await db.execute(
        sql`SELECT * FROM non_conformities WHERE product_id = ${productId} ORDER BY created_at DESC`
      )
      return result.rows || []
    } catch {
      return []
    }
  },

  /**
   * Atualizar status de NC
   */
  async updateStatus(ncId: string, status: string) {
    try {
      await db.execute(
        sql`UPDATE non_conformities SET status = ${status}, updated_at = NOW() WHERE id = ${ncId}`
      )
      return true
    } catch {
      return false
    }
  },

  /**
   * Contar NCs por status
   */
  async getStats() {
    try {
      const result = await db.execute(
        sql`
          SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open,
            SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed,
            SUM(CASE WHEN severity = 'critical' THEN 1 ELSE 0 END) as critical,
            SUM(CASE WHEN severity = 'major' THEN 1 ELSE 0 END) as major,
            SUM(CASE WHEN severity = 'minor' THEN 1 ELSE 0 END) as minor
          FROM non_conformities
        `
      )
      const row = result.rows?.[0] as any
      return {
        total: row?.total || 0,
        open: row?.open || 0,
        closed: row?.closed || 0,
        critical: row?.critical || 0,
        major: row?.major || 0,
        minor: row?.minor || 0,
      }
    } catch {
      return {
        total: 0,
        open: 0,
        closed: 0,
        critical: 0,
        major: 0,
        minor: 0,
      }
    }
  },
}
