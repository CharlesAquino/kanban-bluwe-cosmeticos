'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  Shield, 
  Beaker, 
  Users, 
  Package, 
  ChevronDown,
  Clock,
  BarChart3,
  Factory
} from 'lucide-react'

const adminTabs = [
  { href: "/admin", label: "Admin Home", icon: Shield },
  { href: "/admin/operators", label: "Cadastro de Operadores", icon: Users },
  { href: "/admin/mod", label: "MOD Admin", icon: Users },
  { href: "/admin/quality", label: "Qualidade Admin", icon: Beaker },
  { href: "/semi-finished", label: "Semi-acabados Admin", icon: Package },
]

const overviewRoutes = [
  { href: "/", label: "Overview", icon: BarChart3 },
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/hourly-control", label: "Hora a Hora", icon: Clock },
  { href: "/mod-analysis", label: "MOD", icon: Users },
  { href: "/quality", label: "Qualidade", icon: Beaker },
  { href: "/mod-entry", label: "Produção", icon: Factory },
  { href: "/kanban-overview", label: "Kanban", icon: Package },
]

export function AdminNavbar() {
  const pathname = usePathname()
  const [overviewDropdownOpen, setOverviewDropdownOpen] = useState(false)

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin"
    return pathname?.startsWith(href)
  }

  return (
    <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-slate-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 sm:h-9 sm:w-9 overflow-hidden rounded-md bg-indigo-900 flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div className="leading-tight hidden sm:block">
              <h1 className="text-sm font-semibold text-slate-800">Painel Admin</h1>
              <p className="text-[11px] text-slate-500">Bluwe Cosméticos • Administração</p>
            </div>
          </div>

          <nav className="flex items-center gap-2">
            {/* Navegação entre páginas Admin */}
            {adminTabs
              .filter((t) => !isActive(t.href))
              .map((t) => (
                <Link
                  key={t.href}
                  href={t.href}
                  prefetch
                  className="hidden md:inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-colors bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                >
                  <t.icon className="h-4 w-4" />
                  <span>{t.label}</span>
                </Link>
              ))}

            {/* Dropdown Overview */}
            <div className="relative">
              <button
                onClick={() => setOverviewDropdownOpen(!overviewDropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-colors bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                <BarChart3 className="h-4 w-4" />
                <span>Overview</span>
                <ChevronDown className={`h-3 w-3 transition-transform ${overviewDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {overviewDropdownOpen && (
                <div className="absolute top-full right-0 mt-1 w-56 bg-white border border-slate-200 rounded-lg shadow-xl z-[9999]">
                  <div className="p-2">
                    {overviewRoutes.map((route) => (
                      <Link
                        key={route.href}
                        href={route.href}
                        prefetch={false}
                        onClick={() => setOverviewDropdownOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-slate-50 transition-colors"
                      >
                        <route.icon className="h-4 w-4 text-slate-500" />
                        <span>{route.label}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
}
