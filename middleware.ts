import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Permitir login e assets sem autenticação
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/public') ||
    pathname === '/admin/login' ||
    pathname.startsWith('/api/auth/login')
  ) {
    return NextResponse.next()
  }

  const isProtected =
    pathname === '/' ||
    pathname.startsWith('/semi-finished') ||
    pathname.startsWith('/admin')

  if (!isProtected) {
    return NextResponse.next()
  }

  const token = request.cookies.get('admin_auth')?.value

  if (!token) {
    const loginUrl = new URL('/admin/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/semi-finished/:path*', '/admin/:path*'],
}
