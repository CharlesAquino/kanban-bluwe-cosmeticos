'use client'

interface PerformanceMetric {
  name: string
  value: number
  timestamp: number
  type: 'navigation' | 'resource' | 'paint' | 'custom'
}

interface PerformanceData {
  metrics: PerformanceMetric[]
  sessionStartTime: number
  pageViews: number
  errors: Array<{
    message: string
    stack?: string
    timestamp: number
    url: string
  }>
}

class PerformanceMonitor {
  private data: PerformanceData = {
    metrics: [],
    sessionStartTime: Date.now(),
    pageViews: 0,
    errors: []
  }

  constructor() {
    if (typeof window !== 'undefined') {
      this.init()
    }
  }

  private init() {
    // Monitorar navegação
    this.observeNavigation()
    
    // Monitorar recursos
    this.observeResources()
    
    // Monitorar performance do paint
    this.observePaint()
    
    // Monitorar erros
    this.observeErrors()
    
    // Coletar métricas iniciais
    this.collectInitialMetrics()
  }

  private observeNavigation() {
    // Observer para mudanças de rota
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming
          this.addMetric({
            name: 'page_load_time',
            value: navEntry.loadEventEnd - navEntry.loadEventStart,
            timestamp: Date.now(),
            type: 'navigation'
          })

          this.addMetric({
            name: 'dom_interactive_time',
            value: navEntry.domInteractive - navEntry.loadEventStart,
            timestamp: Date.now(),
            type: 'navigation'
          })

          this.data.pageViews++
        }
      }
    })

    observer.observe({ entryTypes: ['navigation'] })
  }

  private observeResources() {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'resource') {
          const resourceEntry = entry as PerformanceResourceTiming
          this.addMetric({
            name: `resource_${resourceEntry.name.split('/').pop()}`,
            value: resourceEntry.responseEnd - resourceEntry.requestStart,
            timestamp: Date.now(),
            type: 'resource'
          })
        }
      }
    })

    observer.observe({ entryTypes: ['resource'] })
  }

  private observePaint() {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'paint') {
          this.addMetric({
            name: entry.name,
            value: entry.startTime,
            timestamp: Date.now(),
            type: 'paint'
          })
        }
      }
    })

    observer.observe({ entryTypes: ['paint'] })
  }

  private observeErrors() {
    window.addEventListener('error', (event) => {
      this.data.errors.push({
        message: event.message,
        stack: event.error?.stack,
        timestamp: Date.now(),
        url: window.location.href
      })
    })

    window.addEventListener('unhandledrejection', (event) => {
      this.data.errors.push({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        timestamp: Date.now(),
        url: window.location.href
      })
    })
  }

  private collectInitialMetrics() {
    // Coletar métricas do Web Vitals
    if ('web-vitals' in window) {
      // Em produção, instalar web-vitals package
      console.log('Web Vitals available for monitoring')
    }

    // Métricas básicas do navegador
    setTimeout(() => {
      this.addMetric({
        name: 'memory_used',
        value: (performance as any).memory?.usedJSHeapSize || 0,
        timestamp: Date.now(),
        type: 'custom'
      })

      this.addMetric({
        name: 'memory_total',
        value: (performance as any).memory?.totalJSHeapSize || 0,
        timestamp: Date.now(),
        type: 'custom'
      })
    }, 1000)
  }

  addMetric(metric: PerformanceMetric) {
    this.data.metrics.push(metric)
    
    // Manter apenas últimas 100 métricas para não sobrecarregar
    if (this.data.metrics.length > 100) {
      this.data.metrics = this.data.metrics.slice(-100)
    }

    // Enviar para analytics em produção
    if (process.env.NODE_ENV === 'production') {
      this.sendToAnalytics(metric)
    }
  }

  private sendToAnalytics(metric: PerformanceMetric) {
    // Implementar envio para serviço de analytics
    // Ex: Google Analytics, Sentry, etc.
    console.log('Performance metric:', metric)
  }

  // Métricas customizadas
  trackCustomMetric(name: string, value: number) {
    this.addMetric({
      name,
      value,
      timestamp: Date.now(),
      type: 'custom'
    })
  }

  trackApiCall(endpoint: string, duration: number) {
    this.addMetric({
      name: `api_${endpoint.replace(/[^a-zA-Z0-9]/g, '_')}`,
      value: duration,
      timestamp: Date.now(),
      type: 'custom'
    })
  }

  trackUserAction(action: string, duration: number) {
    this.addMetric({
      name: `user_action_${action}`,
      value: duration,
      timestamp: Date.now(),
      type: 'custom'
    })
  }

  // Relatórios
  getReport(): PerformanceData {
    return { ...this.data }
  }

  getMetricsByType(type: PerformanceMetric['type']) {
    return this.data.metrics.filter(metric => metric.type === type)
  }

  getAverageMetric(name: string): number {
    const metrics = this.data.metrics.filter(metric => metric.name === name)
    if (metrics.length === 0) return 0
    return metrics.reduce((sum, metric) => sum + metric.value, 0) / metrics.length
  }

  getErrors(): Array<typeof this.data.errors[0]> {
    return [...this.data.errors]
  }

  // Limpar dados
  clear() {
    this.data = {
      metrics: [],
      sessionStartTime: Date.now(),
      pageViews: 0,
      errors: []
    }
  }

  // Exportar dados
  export() {
    const dataStr = JSON.stringify(this.data, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `performance-data-${Date.now()}.json`
    link.click()
    
    URL.revokeObjectURL(url)
  }
}

// Instância global
export const performanceMonitor = new PerformanceMonitor()

// Hook para React
export function usePerformanceMonitor() {
  return {
    trackCustomMetric: performanceMonitor.trackCustomMetric.bind(performanceMonitor),
    trackApiCall: performanceMonitor.trackApiCall.bind(performanceMonitor),
    trackUserAction: performanceMonitor.trackUserAction.bind(performanceMonitor),
    getReport: performanceMonitor.getReport.bind(performanceMonitor),
    getAverageMetric: performanceMonitor.getAverageMetric.bind(performanceMonitor),
    getErrors: performanceMonitor.getErrors.bind(performanceMonitor),
    export: performanceMonitor.export.bind(performanceMonitor),
    clear: performanceMonitor.clear.bind(performanceMonitor)
  }
}

// Higher-order function para medir performance de funções
export function withPerformanceTracking<T extends (...args: any[]) => any>(
  fn: T,
  name: string
): T {
  return ((...args: any[]) => {
    const start = performance.now()
    const result = fn(...args)
    
    if (result instanceof Promise) {
      return result.finally(() => {
        const duration = performance.now() - start
        performanceMonitor.trackCustomMetric(name, duration)
      })
    } else {
      const duration = performance.now() - start
      performanceMonitor.trackCustomMetric(name, duration)
      return result
    }
  }) as T
}
