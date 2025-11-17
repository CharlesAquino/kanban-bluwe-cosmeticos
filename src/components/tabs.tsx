// Componente Tabs simples - versão genérica
'use client'

export function Tabs({ children, className }: { children: React.ReactNode, className?: string }) {
  return <div className={className}>{children}</div>
}

export function TabsList({ children, className }: { children: React.ReactNode, className?: string }) {
  return <div className={`grid w-full grid-cols-3 ${className || ''}`}>{children}</div>
}

export function TabsTrigger({ children }: { children: React.ReactNode }) {
  return (
    <button className="px-3 py-2 text-sm font-medium border-b-2 border-transparent hover:border-gray-300">
      {children}
    </button>
  )
}

export function TabsContent({ children, className }: { children: React.ReactNode, className?: string }) {
  return <div className={`space-y-6 ${className || ''}`}>{children}</div>
}
