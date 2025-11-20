'use client'

import '../globals.css'
import { ToastProvider } from '@/components/ui/toast'
import { AdminNavbar } from '@/components/admin-navbar'
import ClientGlobalProvider from '@/components/client-global-provider'
import GlobalStatusBanner from '@/components/global-status-banner'
import { Shield } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/admin/login')
    }
  }, [isAuthenticated, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 text-indigo-600 mx-auto mb-4 animate-pulse" />
          <p className="text-slate-600">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Admin */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white grid place-items-center shadow-lg">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Painel Administrativo</h1>
                <p className="text-sm text-slate-500">Bluwe Cosméticos - Sistema de Produção</p>
              </div>
            </div>
            <Link 
              href="/"
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
            >
              ← Voltar para o Sistema
            </Link>
          </div>
        </div>
      </header>

      <ToastProvider>
        <AdminNavbar />
        <ClientGlobalProvider>
          <GlobalStatusBanner />
          {/* Main Content */}
          <main className="max-w-7xl mx-auto px-6 py-8">
            {children}
          </main>
        </ClientGlobalProvider>
      </ToastProvider>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between text-sm text-slate-500">
            <p>© 2024 Bluwe Cosméticos - Todos os direitos reservados</p>
            <p className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Sistema Online
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
