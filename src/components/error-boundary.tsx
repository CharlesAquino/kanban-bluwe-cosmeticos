'use client'

import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error?: Error; reset: () => void }>
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    // Em produção, enviar para serviço de monitoramento
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
      // Ex: Sentry.captureException(error)
    }
  }

  reset = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback
      return <FallbackComponent error={this.state.error} reset={this.reset} />
    }

    return this.props.children
  }
}

function DefaultErrorFallback({ error, reset }: { error?: Error; reset: () => void }) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="h-8 w-8 text-red-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-slate-900 mb-3">
          Oops! Algo deu errado
        </h1>
        
        <p className="text-slate-600 mb-6">
          {process.env.NODE_ENV === 'development' 
            ? error?.message || 'Ocorreu um erro inesperado'
            : 'Ocorreu um erro inesperado. Tente novamente ou contate o suporte.'
          }
        </p>
        
        <div className="flex flex-col gap-3">
          <button
            onClick={reset}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <RefreshCw className="h-4 w-4" />
            Tentar novamente
          </button>
          
          <button
            onClick={() => window.location.href = '/'}
            className="w-full px-4 py-3 text-slate-700 bg-slate-100 rounded-xl font-medium hover:bg-slate-200 transition-colors"
          >
            Voltar para o início
          </button>
        </div>
        
        {process.env.NODE_ENV === 'development' && error && (
          <details className="mt-6 text-left">
            <summary className="text-sm text-slate-500 cursor-pointer hover:text-slate-700">
              Detalhes do erro (desenvolvimento)
            </summary>
            <pre className="mt-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg overflow-auto">
              {error.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  )
}\n\n// Hook para uso em componentes funcionais\nexport function useErrorHandler() {\n  return (error: Error) => {\n    console.error('Error handled by useErrorHandler:', error)\n    \n    // Em produção, enviar para serviço de monitoramento\n    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {\n      // Ex: Sentry.captureException(error)\n    }\n  }\n}"
