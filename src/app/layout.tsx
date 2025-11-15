import './globals.css'
import { ToastProvider } from '@/components/ui/toast'
import { NavBar } from '@/components/nav-bar'
import Image from 'next/image'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { AssistantPanel } from '@/components/assistant-panel'
import ClientGlobalProvider from '@/components/client-global-provider'
import GlobalStatusBanner from '@/components/global-status-banner'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-slate-50 text-slate-800 overflow-x-hidden transition-colors duration-300">
        <ToastProvider>
          <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-slate-200">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 sm:h-9 sm:w-9 overflow-hidden rounded-md bg-blue-900 flex items-center justify-center">
                  {/* Usar favicon existente para evitar 404 */}
                  <Image src="/favicon.ico" alt="Bluwe" width={20} height={20} className="object-contain" />
                </div>
                <div className="leading-tight hidden sm:block">
                  <h1 className="text-sm font-semibold text-slate-800">Kanban de Insumos</h1>
                  <p className="text-[11px] text-slate-500">Bluwe Cosméticos • Produção</p>
                </div>
              </div>
              <NavBar />
            </div>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 pb-2">
              <Breadcrumbs />
            </div>
          </header>
          <ClientGlobalProvider>
            <GlobalStatusBanner />
            {children}
            <AssistantPanel />
          </ClientGlobalProvider>
        </ToastProvider>
      </body>
    </html>
  )
}
