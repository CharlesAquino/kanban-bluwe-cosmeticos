/**
 * Metrics Collection System
 * 
 * Coleta métricas de performance e erros das APIs.
 * Preparado para integração com sistemas de monitoramento (DataDog, New Relic, etc.)
 */

import { ENV } from './environment'

export interface ApiMetric {
  endpoint: string
  method: string
  statusCode: number
  duration: number
  timestamp: string
  error?: string
  userId?: string
}

interface MetricsStore {
  metrics: ApiMetric[]
  errors: Map<string, number> // endpoint -> error count
  latencies: Map<string, number[]> // endpoint -> [durations]
}

class MetricsCollector {
  private store: MetricsStore = {
    metrics: [],
    errors: new Map(),
    latencies: new Map()
  }

  private readonly MAX_METRICS = 1000 // Manter últimas 1000 métricas em memória

  /**
   * Registrar métrica de API
   */
  recordMetric(metric: ApiMetric) {
    // Adicionar à lista
    this.store.metrics.push(metric)

    // Manter limite de memória
    if (this.store.metrics.length > this.MAX_METRICS) {
      this.store.metrics.shift()
    }

    // Rastrear erros
    if (metric.statusCode >= 400) {
      const key = `${metric.method} ${metric.endpoint}`
      const current = this.store.errors.get(key) || 0
      this.store.errors.set(key, current + 1)
    }

    // Rastrear latências
    const latencyKey = `${metric.method} ${metric.endpoint}`
    const latencies = this.store.latencies.get(latencyKey) || []
    latencies.push(metric.duration)

    // Manter últimas 100 latências por endpoint
    if (latencies.length > 100) {
      latencies.shift()
    }
    this.store.latencies.set(latencyKey, latencies)

    // Em produção, enviar para serviço de monitoramento
    if (ENV.isProd) {
      this.sendToMonitoringService()
    }
  }

  /**
   * Obter estatísticas de um endpoint
   */
  getEndpointStats(method: string, endpoint: string) {
    const key = `${method} ${endpoint}`
    const latencies = this.store.latencies.get(key) || []
    const errorCount = this.store.errors.get(key) || 0

    if (latencies.length === 0) {
      return null
    }

    const sorted = [...latencies].sort((a, b) => a - b)
    const p95Index = Math.floor(sorted.length * 0.95)

    return {
      endpoint,
      method,
      totalRequests: latencies.length,
      errorCount,
      errorRate: errorCount / latencies.length,
      avgLatency: latencies.reduce((a, b) => a + b, 0) / latencies.length,
      minLatency: Math.min(...latencies),
      maxLatency: Math.max(...latencies),
      p95Latency: sorted[p95Index],
      lastUpdated: new Date().toISOString()
    }
  }

  /**
   * Obter todas as estatísticas
   */
  getAllStats() {
    const stats = []
    for (const key of this.store.latencies.keys()) {
      const [method, endpoint] = key.split(' ')
      const stat = this.getEndpointStats(method, endpoint)
      if (stat) stats.push(stat)
    }
    return stats
  }

  /**
   * Verificar alertas
   */
  checkAlerts() {
    const alerts = []
    const stats = this.getAllStats()

    for (const stat of stats) {
      // Alerta: taxa de erro > 5%
      if (stat.errorRate > 0.05) {
        alerts.push({
          severity: 'warning',
          type: 'high_error_rate',
          endpoint: stat.endpoint,
          message: `${stat.endpoint} tem taxa de erro de ${(stat.errorRate * 100).toFixed(2)}%`,
          value: stat.errorRate
        })
      }

      // Alerta: latência p95 > 1000ms
      if (stat.p95Latency > 1000) {
        alerts.push({
          severity: 'warning',
          type: 'high_latency',
          endpoint: stat.endpoint,
          message: `${stat.endpoint} p95 latência é ${stat.p95Latency.toFixed(0)}ms`,
          value: stat.p95Latency
        })
      }

      // Alerta crítico: taxa de erro > 10%
      if (stat.errorRate > 0.1) {
        alerts.push({
          severity: 'critical',
          type: 'critical_error_rate',
          endpoint: stat.endpoint,
          message: `${stat.endpoint} tem taxa de erro CRÍTICA de ${(stat.errorRate * 100).toFixed(2)}%`,
          value: stat.errorRate
        })
      }
    }

    return alerts
  }

  /**
   * Enviar para serviço de monitoramento (placeholder)
   */
  private sendToMonitoringService() {
    // TODO: Integrar com DataDog, New Relic, Elastic, etc.
    // Exemplo:
    // datadog.gauge('api.latency', metric.duration, { endpoint: metric.endpoint })
    // datadog.increment('api.requests', 1, { endpoint: metric.endpoint, status: metric.statusCode })
  }

  /**
   * Limpar métricas (útil para testes)
   */
  clear() {
    this.store = {
      metrics: [],
      errors: new Map(),
      latencies: new Map()
    }
  }
}

// Export singleton
export const metricsCollector = new MetricsCollector()
