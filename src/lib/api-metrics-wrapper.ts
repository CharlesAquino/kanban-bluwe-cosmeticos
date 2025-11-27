/**
 * API Metrics Wrapper
 * 
 * Helper para envolver handlers de API e capturar métricas automaticamente
 */

import { NextRequest, NextResponse } from 'next/server'
import { metricsCollector } from './metrics'
import { logger, createRequestContext } from './logger'

export type ApiHandler = (request?: NextRequest) => Promise<NextResponse>

/**
 * Envolver handler de API para capturar métricas
 */
export function withMetrics(
  method: string,
  endpoint: string,
  handler: ApiHandler
): ApiHandler {
  return async (request?: NextRequest) => {
    const startTime = Date.now()

    try {
      const response = await handler(request)
      const duration = Date.now() - startTime

      // Registrar métrica de sucesso
      metricsCollector.recordMetric({
        endpoint,
        method,
        statusCode: response.status,
        duration,
        timestamp: new Date().toISOString()
      })

      // Log estruturado
      logger.info(`API ${method} ${endpoint} - ${response.status}`, {
        duration: `${duration}ms`,
        statusCode: response.status
      })

      return response
    } catch (error) {
      const duration = Date.now() - startTime

      // Registrar métrica de erro
      metricsCollector.recordMetric({
        endpoint,
        method,
        statusCode: 500,
        duration,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      })

      // Log de erro
      logger.apiError(method, endpoint, error as Error, {
        ...createRequestContext(startTime)
      })

      // Retornar erro
      return NextResponse.json({
        success: false,
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      }, { status: 500 })
    }
  }
}
