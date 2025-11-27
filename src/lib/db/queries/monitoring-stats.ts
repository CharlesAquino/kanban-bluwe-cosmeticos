/**
 * Queries Drizzle para Monitoring Stats
 */

import { db } from '../client'
import { sql } from 'drizzle-orm'

export const monitoringStatsQueries = {
  /**
   * Registrar métrica
   */
  async recordMetric(data: {
    metricName: string
    metricValue: number
    unit?: string
    category?: string
    tags?: Record<string, any>
  }) {
    try {
      await db.execute(
        sql`
          INSERT INTO monitoring_stats (id, metric_name, metric_value, unit, category, tags, created_at)
          VALUES (
            ${`ms_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`},
            ${data.metricName},
            ${data.metricValue},
            ${data.unit || null},
            ${data.category || null},
            ${data.tags ? JSON.stringify(data.tags) : null},
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
   * Buscar métricas por nome
   */
  async getByMetricName(metricName: string, limit: number = 100) {
    try {
      const result = await db.execute(
        sql`
          SELECT * FROM monitoring_stats 
          WHERE metric_name = ${metricName}
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
   * Buscar métricas por categoria
   */
  async getByCategory(category: string, limit: number = 100) {
    try {
      const result = await db.execute(
        sql`
          SELECT * FROM monitoring_stats 
          WHERE category = ${category}
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
   * Obter estatísticas agregadas
   */
  async getAggregatedStats(metricName: string) {
    try {
      const result = await db.execute(
        sql`
          SELECT 
            metric_name,
            COUNT(*) as count,
            AVG(metric_value) as avg_value,
            MIN(metric_value) as min_value,
            MAX(metric_value) as max_value,
            STDDEV(metric_value) as stddev_value
          FROM monitoring_stats
          WHERE metric_name = ${metricName}
          GROUP BY metric_name
        `
      )
      return result.rows?.[0] || null
    } catch {
      return null
    }
  },

  /**
   * Limpar métricas antigas (mais de N dias)
   */
  async cleanOldMetrics(daysOld: number = 30) {
    try {
      await db.execute(
        sql`
          DELETE FROM monitoring_stats
          WHERE created_at < NOW() - INTERVAL '${daysOld} days'
        `
      )
      return true
    } catch {
      return false
    }
  },
}
