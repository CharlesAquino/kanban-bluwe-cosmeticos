/**
 * Structured Logger
 * 
 * Sistema centralizado de logging com contexto estruturado.
 * Substitui console.log disperso por logs padronizados e rastreáveis.
 */

import { ENV } from './environment'

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LogContext {
  requestId?: string
  userId?: string
  entityType?: string
  entityId?: string
  stage?: string
  duration?: string
  count?: number
  env?: string
  timestamp?: string
  [key: string]: unknown
}

interface LogEntry {
  level: LogLevel
  message: string
  context?: LogContext
  error?: Error
  timestamp: string
}

class Logger {
  private formatTimestamp(): string {
    return new Date().toISOString()
  }

  private formatContext(context?: LogContext): string {
    if (!context || Object.keys(context).length === 0) {
      return ''
    }
    return JSON.stringify(context, null, 2)
  }

  private log(level: LogLevel, message: string, context?: LogContext, error?: Error) {
    const entry: LogEntry = {
      level,
      message,
      context,
      error,
      timestamp: this.formatTimestamp()
    }

    // Em produção, enviar para serviço de log (DataDog, New Relic, etc.)
    // Por enquanto, log estruturado no console
    const prefix = `[${entry.level.toUpperCase()}] ${entry.timestamp}`
    const mainMessage = `${prefix} - ${message}`

    if (level === 'error') {
      console.error(mainMessage)
      if (context) console.error('Context:', this.formatContext(context))
      if (error) console.error('Error:', error.stack || error.message)
    } else if (level === 'warn') {
      console.warn(mainMessage)
      if (context) console.warn('Context:', this.formatContext(context))
    } else {
      // info ou debug
      console.log(mainMessage)
      if (context) console.log('Context:', this.formatContext(context))
    }
  }

  debug(message: string, context?: LogContext) {
    if (ENV.isDev) {
      this.log('debug', message, context)
    }
  }

  info(message: string, context?: LogContext) {
    this.log('info', message, context)
  }

  warn(message: string, context?: LogContext) {
    this.log('warn', message, context)
  }

  error(message: string, error?: Error, context?: LogContext) {
    this.log('error', message, context, error)
  }

  /**
   * Helper para APIs: log de entrada de request
   */
  apiRequest(method: string, path: string, context?: LogContext) {
    this.info(`API ${method} ${path}`, {
      env: process.env.NODE_ENV,
      timestamp: this.formatTimestamp(),
      ...context
    })
  }

  /**
   * Helper para APIs: log de sucesso com métricas
   */
  apiSuccess(method: string, path: string, context: LogContext) {
    this.info(`API ${method} ${path} - Success`, context)
  }

  /**
   * Helper para APIs: log de erro com stack
   */
  apiError(method: string, path: string, error: Error, context?: LogContext) {
    this.error(`API ${method} ${path} - Error`, error, {
      stack: error.stack,
      ...context
    })
  }
}

// Export singleton
export const logger = new Logger()

/**
 * Helper para criar contexto de request com duração
 */
export function createRequestContext(startTime: number): LogContext {
  return {
    duration: `${Date.now() - startTime}ms`,
    timestamp: new Date().toISOString()
  }
}
