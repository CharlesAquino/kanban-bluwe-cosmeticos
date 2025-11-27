/**
 * Next.js Middleware
 * 
 * Intercepta todas as requisições para:
 * - Capturar métricas de latência e erros
 * - Adicionar headers de segurança
 * - Rastrear requisições
 */

import { NextResponse } from 'next/server'

// Middleware para capturar métricas
export function middleware() {
  // Adicionar headers de segurança
  const response = NextResponse.next()
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')

  // Adicionar request ID para rastreamento
  const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  response.headers.set('X-Request-ID', requestId)

  // Request ID será usado por logger em APIs para correlação
  response.headers.set('X-Correlation-ID', requestId)

  return response
}

// Configurar quais rotas o middleware deve processar
export const config = {
  matcher: [
    // APIs
    '/api/:path*',
    // Excluir arquivos estáticos
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
