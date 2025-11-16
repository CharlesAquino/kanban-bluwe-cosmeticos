import '../globals.css'
import { ToastProvider } from '@/components/ui/toast'
import { AdminNavbar } from '@/components/admin-navbar'
import ClientGlobalProvider from '@/components/client-global-provider'
import GlobalStatusBanner from '@/components/global-status-banner'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ToastProvider>
      <AdminNavbar />
      <ClientGlobalProvider>
        <GlobalStatusBanner />
        {children}
      </ClientGlobalProvider>
    </ToastProvider>
  )
}
