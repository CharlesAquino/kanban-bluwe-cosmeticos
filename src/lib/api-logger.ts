/**
 * API Logger Helper
 * 
 * Wrapper simplificado do logger para usar em rotas de API.
 * Substitui console.log/error por logging estruturado.
 */

import { logger, type LogContext } from './logger'

/**
 * Cria context de API com informações padrão
 */
function createApiContext(extra?: LogContext): LogContext {
    return {
        env: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
        ...extra,
    }
}

/**
 * Substituto para console.log em APIs
 * Usa logger.debug (só aparece em dev) ou logger.info
 */
export function apiLog(message: string, data?: Record<string, unknown>) {
    if (process.env.NODE_ENV === 'development') {
        logger.debug(message, createApiContext(data))
    } else {
        logger.info(message, createApiContext(data))
    }
}

/**
 * Substituto para console.error em APIs
 */
export function apiError(message: string, error?: Error | unknown, data?: Record<string, unknown>) {
    const errorObj = error instanceof Error ? error : new Error(String(error))
    logger.error(message, errorObj, createApiContext(data))
}

/**
 * Substituto para console.warn em APIs
 */
export function apiWarn(message: string, data?: Record<string, unknown>) {
    logger.warn(message, createApiContext(data))
}

/**
 * Log de início de request de API
 */
export function logApiRequest(method: string, endpoint: string, params?: Record<string, unknown>) {
    apiLog(`${method} ${endpoint}`, params)
}

/**
 * Log de sucesso de API com dados retornados
 */
export function logApiSuccess(method: string, endpoint: string, result?: Record<string, unknown>) {
    apiLog(`✅ ${method} ${endpoint} - Success`, result)
}

/**
 * Log de erro de API com stack trace
 */
export function logApiError(method: string, endpoint: string, error: Error | unknown) {
    apiError(`❌ ${method} ${endpoint} - Error`, error)
}

// Re-export logger para casos especiais
export { logger } from './logger'
