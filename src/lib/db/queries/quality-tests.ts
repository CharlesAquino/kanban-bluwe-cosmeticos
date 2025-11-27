/**
 * Queries Drizzle para Quality Tests
 */

import { db } from '../client'
import { desc, eq } from 'drizzle-orm'
import { sql } from 'drizzle-orm'

// Criar tabela de testes de qualidade se não existir
export const qualityTestQueries = {
  /**
   * Criar novo teste de qualidade
   */
  async create(data: {
    productId: string
    productName: string
    batch: string
    stage: string
    parameter: string
    targetValue: number
    tolMin: number
    tolMax: number
    measuredValue: number
    unit: string
    operator: string
    notes?: string
  }) {
    // Determinar se aprovado
    const approved =
      data.measuredValue >= data.tolMin && data.measuredValue <= data.tolMax

    // Usar raw SQL para inserir em tabela que pode não existir em Drizzle
    const result = await db.execute(
      sql`
        INSERT INTO quality_tests (
          id, product_id, product_name, batch, stage, parameter,
          target_value, tol_min, tol_max, measured_value, unit,
          operator, approved, notes, created_at
        ) VALUES (
          ${`qt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`},
          ${data.productId},
          ${data.productName},
          ${data.batch},
          ${data.stage},
          ${data.parameter},
          ${data.targetValue},
          ${data.tolMin},
          ${data.tolMax},
          ${data.measuredValue},
          ${data.unit},
          ${data.operator},
          ${approved},
          ${data.notes || null},
          NOW()
        )
      `
    )

    return {
      id: `qt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...data,
      approved,
      createdAt: new Date(),
    }
  },

  /**
   * Buscar todos os testes
   */
  async getAll() {
    try {
      const result = await db.execute(
        sql`SELECT * FROM quality_tests ORDER BY created_at DESC`
      )
      return result.rows || []
    } catch {
      return []
    }
  },

  /**
   * Buscar testes por produto
   */
  async getByProduct(productId: string) {
    try {
      const result = await db.execute(
        sql`SELECT * FROM quality_tests WHERE product_id = ${productId} ORDER BY created_at DESC`
      )
      return result.rows || []
    } catch {
      return []
    }
  },

  /**
   * Buscar testes por data
   */
  async getByDate(startDate: string, endDate: string) {
    try {
      const result = await db.execute(
        sql`
          SELECT * FROM quality_tests 
          WHERE created_at >= ${startDate} AND created_at <= ${endDate}
          ORDER BY created_at DESC
        `
      )
      return result.rows || []
    } catch {
      return []
    }
  },

  /**
   * Contar testes aprovados vs reprovados
   */
  async getStats() {
    try {
      const result = await db.execute(
        sql`
          SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN approved = true THEN 1 ELSE 0 END) as approved,
            SUM(CASE WHEN approved = false THEN 1 ELSE 0 END) as rejected
          FROM quality_tests
        `
      )
      const row = result.rows?.[0] as any
      return {
        total: row?.total || 0,
        approved: row?.approved || 0,
        rejected: row?.rejected || 0,
        approvalRate:
          row?.total > 0
            ? Math.round(((row?.approved || 0) / row?.total) * 100)
            : 0,
      }
    } catch {
      return { total: 0, approved: 0, rejected: 0, approvalRate: 0 }
    }
  },
}
