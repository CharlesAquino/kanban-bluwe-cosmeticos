'use client'

import '../globals.css'
import { ToastProvider } from '@/components/ui/toast'
import { AdminNavbar } from '@/components/admin-navbar'
import ClientGlobalProvider from '@/components/client-global-provider'
import GlobalStatusBanner from '@/components/global-status-banner'
import { Settings } from 'lucide-react'
import Link from 'next/link'

export default function CMSLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-50">
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
