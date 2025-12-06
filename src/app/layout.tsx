import './globals.css'
import { ToastProvider } from '@/components/ui/toast'
import { AssistantPanel } from '@/components/assistant-panel'
import ClientGlobalProvider from '@/components/client-global-provider'
import GlobalStatusBanner from '@/components/global-status-banner'
import { AuthProvider } from '@/contexts/auth-context'
import { QueryProvider } from '@/components/query-provider'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-50 text-slate-800 overflow-x-hidden transition-colors duration-300" suppressHydrationWarning>
        <ToastProvider>
          <QueryProvider>
            <AuthProvider>
              <ClientGlobalProvider>
                <GlobalStatusBanner />
                {children}
                <AssistantPanel />
              </ClientGlobalProvider>
            </AuthProvider>
          </QueryProvider>
        </ToastProvider>
      </body>
    </html>
  )
}
