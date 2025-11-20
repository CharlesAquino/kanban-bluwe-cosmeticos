import { NextResponse } from 'next/server'

// Middleware neutro: não aplica nenhuma regra de autenticação ou redirecionamento.
// Mantido apenas por compatibilidade futura, caso seja necessário reativar regras.
export function middleware() {
  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/semi-finished/:path*', '/admin/:path*'],
}
