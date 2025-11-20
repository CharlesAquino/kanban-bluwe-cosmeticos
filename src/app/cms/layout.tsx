import { ReactNode } from 'react'

export default function CmsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">CMS - Centro de Monitoramento</h1>
          <nav className="flex space-x-4">
            <a href="/cms/mod" className="text-slate-600 hover:text-slate-900">MOD</a>
            <a href="/cms/quality" className="text-slate-600 hover:text-slate-900">Qualidade</a>
            <a href="/" className="text-slate-600 hover:text-slate-900">Kanban</a>
          </nav>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  )
}
